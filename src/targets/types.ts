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
}

export interface BuildOptions {
  target?: string;
  addin?: string;
}

export interface ExportOptions {}
