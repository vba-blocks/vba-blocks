import { Config } from '../config';
import { Registration } from './registration';
import { GitDependency } from '../manifest/dependency';

export async function resolve(
  config: Config,
  dependency: GitDependency
): Promise<Registration[]> {
  // TODO
  //
  // 1. Shallow clone repository to cache
  // 2. Checkout branch, tag, or revision
  // 3. Convert manifest to registration
  // 4. source = git+{repo}#{revision}

  return [];
}

export async function fetch(
  config: Config,
  registration: Registration
): Promise<string> {
  // TODO
  //
  // 1. Checkout revision
  // 2. Return path to local cache

  return '';
}
