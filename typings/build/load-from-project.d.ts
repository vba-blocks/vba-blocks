import { Manifest } from '../manifest/types';
import { Project } from '../types';
import { BuildGraph } from './types';
export default function loadFromProject(project: Project, dependencies: Manifest[]): Promise<BuildGraph>;
