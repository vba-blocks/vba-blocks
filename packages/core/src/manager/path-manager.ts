import { Config } from '../config';
import { Registration } from './registration';
import { PathDependency } from '../manifest/dependency';

export async function resolve(
  config: Config,
  dependency: PathDependency
): Promise<Registration[]> {
  // TODO
  //
  // 1. Convert manifest to registration
  // 2. source = path+{path}

  return [];
}

export async function fetch(
  config: Config,
  registration: Registration
): Promise<string> {
  // TODO
  //
  // 1. Return path

  return '';
}
