import { Manager } from './manager';
import { Registration } from './registration';
import { PathDependency } from '../manifest/dependency';

const path: Manager = {
  async prepare(config) {},
  async resolve(config, dependency: PathDependency): Promise<Registration[]> {
    return [];
  },
  async fetch(config, registration) {}
};
export default path;
