import { CliErrors } from './errors';
import { Target } from './manifest';

const errors: CliErrors = {
  'unsupported-source': type =>
    `${type} dependencies are not supported. 

Upgrade to Professional Edition for ${type} dependencies and more`,
  'target-is-open': (target, path) =>
    `Failed to build target "${target.name}", it is currently open. 

Please close "${path}" and try again.`,
  'unknown-command': command =>
    `Unknown command "${command}". 

Try "vba-blocks --help" for a list of commands.`
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
  progress() {
    return {
      start(count?: number) {},
      tick() {},
      done() {}
    };
  },

  errors
};
