import { TargetType } from '../manifest/types';
import { AddOptions, ProjectInfo } from './types';
export default function addTarget(type: TargetType, info: ProjectInfo, options?: AddOptions): Promise<void>;
