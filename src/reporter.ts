import { Message } from './messages';
import { Reporter, Progress } from './types';

export const reporter: Reporter = {
  log(_id: Message, message: string) {
    if (!this.silent) console.log(message);
  },

  progress(name): Progress {
    return {
      start: () => {
        if (!this.silent) console.log(name);
      },
      tick() {},
      done() {}
    };
  }
};
