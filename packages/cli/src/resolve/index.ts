import { Config } from '../config';
import { Manifest } from '../manifest';
import { loadLockfile, writeLockfile } from './lockfile';

export interface DependencyGraph {}

export default async function resolve(
  config: Config,
  manifest: Manifest
): Promise<DependencyGraph> {
  return {};
}
