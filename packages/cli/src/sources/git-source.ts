import { Registration } from './registration';
import { GitDependency } from '../manifest/dependency';
import { Source } from './source';

const git: Source = {
  async resolve(dependency: GitDependency): Promise<Registration[]> {
    // TODO
    //
    // 1. Shallow clone repository to cache
    // 2. Checkout branch, tag, or revision
    // 3. Convert manifest to registration
    // 4. source = git+{repo}#{revision}

    return [];
  },

  async fetch(registration: Registration): Promise<string> {
    // TODO
    //
    // 1. Checkout revision
    // 2. Return path to local cache

    return '';
  }
};
export default git;
