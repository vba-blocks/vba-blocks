# CLI

### Add

Add the given block to the project. Recalculate dependency tree, update `vba-block.lock`, and download dependencies, as-needed.

```
Usage:
  vba-blocks add <block> [options]

Options:
  --git URL     Add block from url, using <git remote url>[#<branch/commit/tag>]
  --path PATH   Add block from given path

Arguments:
  block         block-name, block-name@1.2.3, block-name@tag
```

### Remove

Remove one or more packages from the project. Recalculate dependency tree and update `vba-block.lock`.

```
Usage:
  vba-blocks remove <block>...

Arguments:
  block(s)  Block names to remove
```

### Update

Update given block or all blocks. Recalculate dependency tree, update `vba-block.lock`, and download dependencies, as-needed.

```
Usage:
  vba-blocks update [<block>]

Arguments:
  block     block name to update
```

### Build

```
Usage:
  vba-blocks build [options]

Options:
  --release               Build for release
  --features FEATURES     Space-separated list of features to build
  --all-features          Build all available features
  --no-default-features   Do not build the `default` feature
```

### Test

```
Usage:
  vba-blocks test [options] [<filters>...]

Options:
  (options passed to test function)  

Arguments:
  filters...  Test filters (generally by name)
```

Initially, there will be no default test runner for vba-blocks,
instead one can be specified in `vba-block.toml`

```toml
[package]
test = "'workbook name.xlsm'!Specs.RunSpecs"
```

This is then called with the project's manifest and test options/arguments:

```vb
Public Function RunSpecs(Manifest As Dictionary, Options As Dictionary) As String
  Dim Filters As Collection
  Set Filters = Options("filters")

  RunSpecs = "TAP output"
End Function
```

### Init

Create a new vba-blocks project in the current directory.

```
Usage:
  vba-blocks init [options]

Options:
  --name NAME   Set the package name
```

### Version

Set the package's version and (when git's present) commit and tag with version.

```
Usage:
  vba-blocks version [<version> | major | minor | patch | prerelease]
```

### Publish

Upload a package to vba-blocks.

```
Usage:
  vba-blocks publish [options]

Options:
  --dry-run   Perform all checks without uploading
```

### List

List currently installed dependencies (and sub-dependencies).

```
Usage:
  vba-blocks list
```

### Search

Search vba-blocks.com registry

```
Usage:
  vba-blocks search <query>...
```

## vba-block.lock

By definition, only a single version of a dependency can be loaded for a VBA project.
This forces the dependency tree to be simplified to a flat list.

```toml
# vba-block.toml
[package]
name = "my-package"
version = "1.0.0"

[dependencies]
a = "1.2.3"
b = { path: "../b" }
c = { git: "https://github.com/author/repo" }
```

```toml
# vba-block.lock
[root]
name = "my-package"
version = "1.0.0"
dependencies = [
  "a 1.2.3 (registry+https://github.com/vba-blocks/registry)",
  "b 4.5.6",
  "c 7.8.9 (git+https://github.com/author/repo)",
]

[[package]]
name = "a"
version = "1.2.3"
source = "registry+https://github.com/vba-blocks/registry"
dependencies = [
  "d 0.0.0 (registry+https://github.com/vba-blocks/registry)",
]

[[package]]
name = "b"
version = "4.5.6"

[[package]]
name = "c"
version = "7.8.9"
source = "git+https://github.com/author/repo#sha"

[[package]]
name = "d"
version = "0.0.0"
source = "registry+https://github.com/vba-blocks/registry"

[metadata]
"checksum a 1.2.3 (registry+https://github.com/vba-blocks/registry)" = "..."
"checksum c 7.8.9 (git+https://github.com/author/repo)" = "<none>"
"checksum d 0.0.0 (registry+https://github.com/vba-blocks/registry)" = "..."
```

# Dependency Resolution

Fresh build (no lockfile)

1. Load manifest
2. Update registry
3. Resolve dependencies
4. Write lockfile

With valid lockfile

1. Load manifest
2. Load lockfile
3. Compare to lockfile -> valid!

With invalid lockfile

1. Load manifest
2. Load lockfile
3. Compare to lockfile -> invalid.
4. Resolve dependencies
5. Write lockfile

# Build

1. Resolve dependencies
2. Download dependencies (from lockfile)
3. Create target binaries
4. Install src
5. Install dependencies (from lockfile)
