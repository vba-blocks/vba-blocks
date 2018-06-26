import { normalize, join } from '../../src/utils/path';

export const dir = normalize(__dirname);

export const cache = join(dir, '.vba-blocks');
export const sources = join(cache, 'sources');

export const projects = join(dir, 'projects');
export const empty = join(projects, 'empty');
export const standard = join(projects, './standard');
export const needsSat = join(projects, 'needs-sat');
export const invalidManifest = join(projects, 'invalid-manifest');
export const unresolvable = join(projects, 'unresolvable');
