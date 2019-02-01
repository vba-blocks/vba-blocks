import { Project } from '../types';
import { Target } from '../manifest/types';
import { ProjectInfo, BuildOptions } from './types';
/**
 * Build target:
 *
 * 1. Create fresh target in staging
 * 2. Import project
 * 3. Backup previously built target
 * 4. Move built target to build
 */
export default function buildTarget(target: Target, info: ProjectInfo, options?: BuildOptions): Promise<void>;
/**
 * Create target binary
 */
export declare function createTarget(project: Project, target: Target): Promise<string>;
/**
 * Import project into target
 *
 * 1. Create "import" staging directory
 * 2. Load build graph for project
 * 3. Stage build graph
 * 4. Import staged build graph
 */
export declare function importTarget(target: Target, info: ProjectInfo, file: string, options?: BuildOptions): Promise<void>;
/**
 * Backup previously built target (if available)
 *
 * - Removes previous backup (if found)
 * - Attempts move, if that fails, it is assumed that the file is open
 */
export declare function backupTarget(project: Project, target: Target): Promise<void>;
/**
 * Restore previously built target (if available)
 */
export declare function restoreTarget(project: Project, target: Target): Promise<void>;
