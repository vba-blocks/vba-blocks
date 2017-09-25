import { Config } from '../config';
import { Registration } from './registration';
import { Dependency } from '../manifest/dependency';
import { Source } from './source';
import { has, isString } from '../utils';

interface GitDependency extends Dependency {
  git: string;
  branch?: string;
  tag?: string;
  rev?: string;
}

const git: Source = {
  match(type) {
    if (isString(type)) return type === 'git';
    return isGitDependency(type);
  },

  async resolve(config, dependency: GitDependency): Promise<Registration[]> {
    // TODO
    //
    // 1. Shallow clone repository to cache
    // 2. Checkout branch, tag, or revision
    // 3. Convert manifest to registration
    // 4. source = git+{repo}#{revision}

    return [];
  },

  async fetch(config, registration): Promise<string> {
    // TODO
    //
    // 1. Checkout revision
    // 2. Return path to local cache

    return '';
  }
};
export default git;

function isGitDependency(dependency: Dependency): dependency is GitDependency {
  return has(dependency, 'git');
}
