import { join, normalize } from '../../src/utils/path';

export const dir = normalize(__dirname);

export const cache = join(dir, '.vba-blocks');
export const sources = join(cache, 'sources');

export const projects = join(dir, 'projects');
export const empty = join(projects, 'empty');
export const json = join(projects, 'json');
export const standard = join(projects, 'standard');
export const complex = join(projects, 'complex');
export const dev = join(projects, 'dev');
export const needsSat = join(projects, 'needs-sat');
export const invalidManifest = join(projects, 'invalid-manifest');
export const unresolvable = join(projects, 'unresolvable');
export const single = join(projects, 'single');
export const targetless = join(projects, 'targetless');

export const staging = join(cache, 'staging');
export const standardImport = join(staging, 'standard', 'import');
export const standardExport = join(staging, 'standard', 'export');
export const standardChangesExport = join(staging, 'standard-changes', 'export');
