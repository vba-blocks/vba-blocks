import { createProject } from '../__helpers__';
import * as manifests from './manifests';

export const simple = createProject(manifests.simple);
export const complex = createProject(manifests.complex);
