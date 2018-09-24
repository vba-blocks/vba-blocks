# vba-blocks build

Build consists of four high-level operations that will be detailed below. The steps are designed to ensure reproducible and correct builds and include source transformation phases for dealing with platform differences and future applications.

1. Load project
2. Fetch dependencies
3. Build target(s)
4. Write lockfile

## 1. Load project

A project consists of all the relevant information needed for working with vba-blocks projects/packages, including the manifest, workspace, and resolved dependencies.

1. The `vba-block.toml` manifest is loaded in the current working directory
2. If the project is part of a workspace, the workspace is loaded, including all related manifests
3. The project or workspace lockfile is loaded and evaluated to determine if it is valid and up-to-date. The lockfile contains the entire resolved dependency graph and is compared to the project's required dependencies to ensure all are present and a matching version.
4. If the lockfile is valid, the dependency tree is loaded directly from the lockfile, otherwise the registry, path, and git resolvers calculate the dependency tree

Details:

- Project: src/project = Manifest + Workspace + DependencyGraph
- Manifest: src/manifest
- Workspace: src/workspace
- DependencyGraph: src/resolve/dependency-graph
- resolve: src/resolve/index (see design/resolve.md for details)

Potential Errors:

- manifest-not-found
- manifest-invalid
- (resolving) configuration issues: source-misconfigured-registry or dependency-unknown-source
- (resolving) dependency-not-found
- (resolving) resolve-failed
- TODO target-not-found

## 2. Fetch dependencies

Using the resolved dependency tree from the project, each of the project's dependencies is fetched and loaded. A global dependency cache is maintained for registry and git dependencies, so if the desired version of a dependency exists in the cache, it is loaded directly. Otherwise, the dependency is loaded from the registry, path, or git source and cached as necessary.

Details:

- Cache: `{user}/.vba-blocks` includes registry -> packages -> sources (cache for each stage of resolve and fetch)

Potential Errors:

- source-download-failed
- dependency-invalid-checksum
- TODO source-path-not-found
- manifest-not-found or manifest-invalid

## 3. Build target(s)

1. Create binary for target by zipping the given or blank target into a Workbook, Document, Presentation, etc. with no VBA project
2. Create a `BuildGraph` from the projects src files and dependencies. The `BuildGraph` is a representation of the VBA project, including the project name, components, and references
3. Transform the `BuildGraph` as needed. Currently, this entails normalizing line-endings, but in the future additional source transformations can occur
4. Stage the `BuildGraph` to the filesystem in a staging directory that Office can access
5. Import the staged `BuildGraph` into the previously created binary from the vba-blocks addin

Details:

- `BuildGraph` checks for conflicting component names and reference versions to validate the VBA project
- build/transform-build-graph converts all line-endings to `\r\n` for platform interoperability

Potential Errors:

- component-unrecognized
- build-invalid
- target-create-failed
- target-import-failed
- target-is-open
- target-restore-failed

## 4. Write lockfile

If the lockfile was invalid, write the project's dependency tree to the lockfile upon a successful build to lock the project's dependencies at a known good state.

Details:

- The lockfile is a combination of the Workspace and DependencyGraph and is serialized to toml in a format that should be compatible with source control

Potential Errors:

- lockfile-write-failed
