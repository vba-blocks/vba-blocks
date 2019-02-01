import { Workspace } from '../types';
import { Lockfile } from './types';
/**
 * Read lockfile at given dir (if present)
 * (for invalid lockfile, errors are ignored and treated as no lockfile)
 */
export declare function readLockfile(dir: string): Promise<Lockfile | null>;
/**
 * Write lockfile for project to given dir
 *
 * @throws lockfile-write-failed
 */
export declare function writeLockfile(dir: string, lockfile: Lockfile): Promise<void>;
export declare function isLockfileValid(lockfile: Lockfile, workspace: Workspace): Promise<boolean>;
export declare function toToml(lockfile: Lockfile, dir: string): string;
export declare function fromToml(toml: string, dir: string): Promise<Lockfile>;
