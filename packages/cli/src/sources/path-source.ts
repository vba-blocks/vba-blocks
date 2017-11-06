import { Registration } from './registration';
import { PathDependency } from '../manifest/dependency';
import { Source } from './source';

const path: Source = {
  async resolve(dependency: PathDependency): Promise<Registration[]> {
    // TODO
    //
    // 1. Convert manifest to registration
    // 2. source = path+{path}

    return [];
  },

  async fetch(registration: Registration): Promise<string> {
    // TODO
    //
    // 1. Return path

    return '';
  }
};
export default path;
