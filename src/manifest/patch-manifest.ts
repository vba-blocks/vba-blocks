import dedent from 'dedent';
import { relative } from '../utils/path';
import { Manifest, Source, Dependency, Target } from './';
import { isRegistryDependency, isPathDependency } from './dependency';

export function applyChanges(changes: string[]) {
  console.log(
    `The following changes need to be applied to vba-block.toml:\n\n${changes.join(
      '\n\n'
    )}`
  );
}

export function addSource(manifest: Manifest, source: Source): string {
  const relative_path = relative(manifest.dir, source.path);
  const relative_binary_path =
    source.binary && relative(manifest.dir, source.binary);

  const details = relative_binary_path
    ? `{ path = "${relative_path}", binary = "${relative_binary_path}" }`
    : `"${relative_path}"`;

  return dedent`
    Add the following to the [src] section:
    ${source.name} = ${details}`;
}

export function removeSource(_: Manifest, name: string): string {
  return `Remove \`${name}\` from the [src] section`;
}

export function addDependency(
  manifest: Manifest,
  dependency: Dependency
): string {
  let details;
  if (isRegistryDependency(dependency)) {
    const { version, registry } = dependency;
    details =
      registry !== 'vba-blocks'
        ? `{ version = "${version}", registry = "${registry}" }`
        : `"${version}"`;
  } else if (isPathDependency(dependency)) {
    const relative_path = relative(manifest.dir, dependency.path);
    details = `{ path = "${relative_path}" }`;
  } else {
    const { git, tag, branch, rev } = dependency;
    if (rev) {
      details = `{ git = "${git}", rev = "${rev}" }`;
    } else if (tag) {
      details = `{ git = "${git}", tag = "${tag}" }`;
    } else if (branch !== 'master') {
      details = `{ git = "${git}", branch = "${branch}" }`;
    } else {
      details = `{ git = "${git}" }`;
    }
  }

  return dedent`
    Add the following to the [dependencies] section:
    ${dependency.name} = ${details}`;
}

export function removeDependency(_: Manifest, name: string): string {
  return `Remove \`${name}\` from the [dependencies] section`;
}

export function addTarget(manifest: Manifest, target: Target): string {
  const relative_path = relative(manifest.dir, target.path);
  const details =
    target.name !== manifest.name
      ? `{ name = "${target.name}" path = "${relative_path}" }`
      : `"${relative_path}"`;

  return dedent`
    Add the following to the [targets] section:
    ${target.type} = ${details}`;
}
