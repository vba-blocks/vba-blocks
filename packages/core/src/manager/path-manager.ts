import { Config } from '../config';
import { Registration } from './registration';
import { PathDependency } from '../manifest/dependency';

export async function resolve(
  config: Config,
  dependency: PathDependency
): Promise<Registration[]> {
  return [];
}
