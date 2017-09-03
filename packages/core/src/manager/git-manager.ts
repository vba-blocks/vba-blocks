import { Manager } from './manager';
import { Registration } from './registration';
import { GitDependency } from '../manifest/dependency';

const git: Manager = {
  async prepare(config) {},
  async resolve(config, dependency: GitDependency): Promise<Registration[]> {
    return [];
  },
  async fetch(config, registration) {}
};
export default git;
