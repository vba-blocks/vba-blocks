import { getRegistration } from './dependency-graph';
import Resolver from './resolver';
import { Config, Workspace } from '../types';
import { DependencyGraph } from './types';
export { getRegistration, Resolver };
export default function resolve(config: Config, workspace: Workspace, preferred?: DependencyGraph): Promise<DependencyGraph>;
