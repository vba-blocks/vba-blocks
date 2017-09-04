import { Config } from '../config';
import { Registration } from './registration';
import { GitDependency } from '../manifest/dependency';

export async function resolve(
  config: Config,
  dependency: GitDependency
): Promise<Registration[]> {
  return [];
}

export async function fetch(
  config: Config,
  registration: Registration
): Promise<string> {
  return '';
}
