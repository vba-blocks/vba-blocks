import env from '../../src/env';
import { reset as resetFs } from '../../src/utils/fs';
import { pull } from '../../src/utils/git';
import { join } from '../../src/utils/path';
import { loadConfig } from '../../src/config';
import { loadProject, fetchDependencies } from '../../src/project';
import { loadManifest } from '../../src/manifest';
import { loadWorkspace } from '../../src/workspace';
import { cache } from '../__fixtures__';

jest.mock('../../src/utils/fs');
jest.mock('../../src/utils/git');

const original_env = { ...env };

export function setupEnvironment(cwd: string) {
  env.cwd = cwd;
  env.cache = cache;
  env.registry = join(cache, 'registry');
  env.packages = join(cache, 'packages');
  env.sources = join(cache, 'sources');
}

export async function setup(cwd: string) {
  setupEnvironment(cwd);

  const project = await loadProject();
  const dependencies = await fetchDependencies(project);

  return { project, dependencies };
}

export async function setupWorkspace(cwd: string) {
  setupEnvironment(cwd);

  const manifest = await loadManifest(cwd);
  const config = await loadConfig();
  const workspace = await loadWorkspace(manifest);

  return {
    manifest,
    workspace,
    config
  };
}

export function reset() {
  resetFs();

  env.cwd = original_env.cwd;
  env.cache = original_env.cache;
  env.registry = original_env.registry;
  env.packages = original_env.packages;
  env.sources = original_env.sources;
}
