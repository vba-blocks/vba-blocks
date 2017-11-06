export interface Errors {
  'unsupported-git': Error;
  'unsupported-path': Error;
}

const errors: Errors = {
  'unsupported-git': new Error(
    'git dependencies are not supported. Upgrade to Professional Edition for git dependencies and more'
  ),
  'unsupported-path': new Error(
    'path dependencies are not supported. Upgrade to Professional Edition for path dependencies and more'
  )
};

export interface Reporter {
  progress: (name?: string) => Progress;
  errors: Errors;
  error: (id: keyof Errors) => Error;
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

  errors,
  error(id) {
    return errors[id] || new Error(`An unknown error occurred. (#${id})`);
  }
};
