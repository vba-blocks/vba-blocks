import { Project } from '../types';
import { Changeset } from './types';
export default function applyChangeset(project: Project, changeset: Changeset, options?: {
    __temp__log_patch: boolean;
}): Promise<void>;
