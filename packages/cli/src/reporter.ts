import { CliErrors } from './errors';
import { Target } from './manifest';

const errors: CliErrors = {
  'unknown-command': command =>
    `Unknown command "${command}". 

Try "vba-blocks --help" for a list of commands.`,
  'unsupported-source': type =>
    `${type} dependencies are not supported. 

Upgrade to Professional Edition for ${type} dependencies and more`,
  'dependency-not-found': (dependency, registry) =>
    `Dependency "${dependency}" not found in registry "${registry}"`,
  'dependency-invalid-checksum': registration =>
    `Dependency "${registration.name}" failed validation.
The downloaded file signature for ${
      registration.id
    } does not match the signature in the registry.`,
  'target-not-found': target =>
    `Target "${target.name}" not found at "${target.path}"`,
  'target-is-open': (target, path) =>
    `Failed to build target "${target.name}", it is currently open. 

Please close "${path}" and try again.`,
  'target-import-failed': target =>
    `Failed to import project for target "${target.name}"`,
  'target-restore-failed': (backup, file) =>
    `Failed to automatically restore backup from "${backup}" to "${file}".
The previous version can be moved back manually, if desired.`,
  'resolve-failed': () =>
    `Unable to resolve dependency graph for project.
There are dependencies that cannot be satisfied.`
};

export interface Reporter {
  progress: (name?: string) => Progress;
  errors: CliErrors;
}

export interface Progress {
  start: (count?: number) => void;
  tick: () => void;
  done: () => void;
}

export const reporter: Reporter = {
  progress(): Progress {
    return {
      start(count?: number) {},
      tick() {},
      done() {}
    };
  },

  errors
};
