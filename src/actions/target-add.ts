import { loadProject, fetchDependencies } from '../project';
import addTarget from '../targets/add-target';
import { targetAddNoType } from '../errors';

import { AddOptions } from './types';

export default async function add(options: AddOptions) {
  const { type, from, name, path } = options;
  if (!type) {
    throw targetAddNoType();
  }

  const project = await loadProject();
  const dependencies = await fetchDependencies(project);

  await addTarget(type, { project, dependencies }, { from, name, path });
}
