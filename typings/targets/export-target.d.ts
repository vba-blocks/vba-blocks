import { Project } from '../types';
import { Target } from '../manifest/types';
import { ExportOptions, ProjectInfo } from './types';
/**
 * Export target (with staging directory)
 *
 * 1. Export source from target to staging (done previously)
 * 2. Extract target to staging
 * 3. Export build graph to src
 * 4. Move extracted to target to src
 */
export default function exportTarget(target: Target, info: ProjectInfo, staging: string, options?: ExportOptions): Promise<void>;
export declare function extractTarget(project: Project, target: Target, staging: string): Promise<string>;
