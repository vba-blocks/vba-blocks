import { Config } from '../config';
import { Registration } from './registration';
import { Dependency } from '../manifest/dependency';
import { Source } from './source';
import { has, isString } from '../utils';

interface PathDependency extends Dependency {
  path: string;
}

const path: Source = {
  match(type) {
    if (isString(type)) return type === 'path';
    return isPathDependency(type);
  },

  toDependency(registration) {
    const { name, source } = registration;
    const [type, path] = source;

    return { name, path };
  },

  satisfies(value: PathDependency, comparison: PathDependency) {
    return true;
  },

  async resolve(config, dependency: PathDependency): Promise<Registration[]> {
    // TODO
    //
    // 1. Convert manifest to registration
    // 2. source = path+{path}

    return [];
  },

  async fetch(config, registration): Promise<string> {
    // TODO
    //
    // 1. Return path

    return '';
  }
};
export default path;

function isPathDependency(
  dependency: Dependency
): dependency is PathDependency {
  return has(dependency, 'path');
}
