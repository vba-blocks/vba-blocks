import dedent from 'dedent/macro';
import { relative } from '../utils/path';
import { isRegistryDependency, isPathDependency } from './dependency';
import { Message } from '../messages';
import env from '../env';

import { Manifest, Source, Dependency, Reference, Target } from './types';

export function applyChanges(changes: string[]) {
  if (!changes.length) return;

  env.reporter.log(
    Message.PatchApplyChanges,
    `\nThe following changes need to be applied to vba-block.toml:\n\n${changes.join('\n\n')}`
  );
}

export function addSource(manifest: Manifest, source: Source): string {
  const relative_path = relative(manifest.dir, source.path);
  const relative_binary_path = source.binary && relative(manifest.dir, source.binary);

  const details = relative_binary_path
    ? `{ path = "${relative_path}", binary = "${relative_binary_path}" }`
    : `"${relative_path}"`;

  return dedent`
    Add the following to the [src] section:
    ${source.name} = ${details}`;
}

export function removeSource(_: Manifest, name: string): string {
  return `Remove "${name}" from the [src] section`;
}

export function addDependency(manifest: Manifest, dependency: Dependency): string {
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
  return `Remove "${name}" from the [dependencies] section`;
}

export function addReference(_manifest: Manifest, reference: Reference): string {
  const details = `{ version = "${reference.version}", guid = "${reference.guid}" }`;

  return dedent`
    Add the following to the [references] section:
    ${reference.name} = ${details}`;
}

export function removeReference(_manifest: Manifest, name: string): string {
  return `Remove "${name}" from the [references] section`;
}

export function addTarget(manifest: Manifest, target: Target): string {
  const relative_path = relative(manifest.dir, target.path);

  let details;
  if (target.name !== manifest.name && relative_path !== 'target') {
    details = target.type;
  } else {
    details = `{ type = "${target.type}"`;
    if (target.name !== manifest.name) details += `, name = "${target.name}"`;
    if (relative_path !== 'target') details += `, path = "${relative_path}"`;
    details += ' }';
  }

  return dedent`
    Add the following to the [${manifest.type}] section:
    target = ${details}`;
}
