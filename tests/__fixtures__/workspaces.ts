import { createWorkspace } from '../__helpers__';
import * as manifests from './manifests';

export const simple = createWorkspace(manifests.simple);
export const complex = createWorkspace(manifests.complex);
export const needsSat = createWorkspace(manifests.needsSat);
export const unresolvable = createWorkspace(manifests.unresolvable);
