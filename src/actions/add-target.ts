import { TargetType } from '../manifest/target';
import { loadProject, fetchDependencies } from '../project';
import addTarget from '../targets/add-target';

export interface AddOptions {
  type: TargetType;
  from?: string;
  name?: string;
  path?: string;
}

export default async function add(options: AddOptions) {
  let { type, from, name, path } = options;
  if (!type) {
    throw new Error('type is required (e.g. vba-blocks target add xlsm)');
  }

  const project = await loadProject();
  const dependencies = await fetchDependencies(project);

  await addTarget(type, { project, dependencies }, { from, name, path });
}
