import { inc, ReleaseType, valid } from 'semver';
import { CliError, ErrorCode } from '../errors';
import { writeManifest } from '../manifest';
import { loadProject } from '../project';

interface IncrementVersionOptions {
  preid?: string;
}

const release_types = ['patch', 'minor', 'major', 'prepatch', 'preminor', 'premajor', 'prerelease'];

export default async function incrementVersion(
  increment: string,
  options: IncrementVersionOptions = {}
): Promise<string> {
  const project = await loadProject();

  const current_version = project.manifest.version;
  const is_increment = isReleaseType(increment);

  let version;
  try {
    version = is_increment
      ? inc(current_version, increment as ReleaseType, undefined, options.preid)
      : valid(increment);
  } catch (_error) {}

  if (!version) {
    throw new CliError(ErrorCode.InvalidVersion, `Invalid version increment "${increment}"`);
  }

  project.manifest.version = version;
  await writeManifest(project.manifest, project.paths.dir);

  return version;
}

function isReleaseType(value: string): value is ReleaseType {
  return release_types.includes(value);
}
