import { inc, ReleaseType, valid } from 'semver';
import { CliError, ErrorCode } from '../errors';
import { writeManifest } from '../manifest';
import { loadProject } from '../project';
import { addAll, commit, tag } from '../utils/git';

interface IncrementVersionOptions {
  preid?: string;
  message?: string;
  git?: boolean;
  sign?: boolean;
}

const release_types = ['patch', 'minor', 'major', 'prepatch', 'preminor', 'premajor', 'prerelease'];

export default async function incrementVersion(
  increment: string,
  options: IncrementVersionOptions = {}
): Promise<string> {
  const { git: use_git = true, sign: sign_tag = false } = options;
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
    throw new CliError(ErrorCode.InvalidVersion, `Invalid version change "${increment}"`);
  }

  project.manifest.version = version;
  await writeManifest(project.manifest, project.paths.dir);

  if (use_git) {
    const display_version = `v${version}`;

    await addAll(project.paths.dir);
    await commit(project.paths.dir, options.message || display_version);
    await tag(project.paths.dir, display_version, sign_tag);
  }

  return version;
}

function isReleaseType(value: string): value is ReleaseType {
  return release_types.includes(value);
}
