import { Project } from '../types';
import { Manifest } from '../manifest/types';
export interface ProjectInfo {
    project: Project;
    dependencies: Manifest[];
}
export interface AddOptions {
    from?: string;
    name?: string;
    path?: string;
    __temp__log_patch?: boolean;
}
export interface BuildOptions {
    target?: string;
    addin?: string;
}
export interface ExportOptions {
    __temp__log_patch?: boolean;
}
