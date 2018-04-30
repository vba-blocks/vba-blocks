import { unixPath, unixJoin } from '@vba-blocks/src/utils';

export const dir = unixPath(__dirname);
export const empty = unixJoin(__dirname, './empty');

// TODO merge these into standard = "kitchen sink"
export const project = unixJoin(__dirname, './project');
export const standard = unixJoin(__dirname, './standard');

export const sources = unixJoin(__dirname, './sources');
