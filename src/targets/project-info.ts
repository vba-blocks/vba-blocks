import { Project } from '../project';
import { Manifest } from '../manifest';

export interface ProjectInfo {
  project: Project;
  dependencies: Manifest[];
}
