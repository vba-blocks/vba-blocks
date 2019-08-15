import { CliError, ErrorCode } from '../errors';
import { TargetType } from '../manifest/target';
import { fetchDependencies, loadProject } from '../project';
import addTarget from '../targets/add-target';

export interface AddOptions {
  type: TargetType;
  from?: string;
  name?: string;
  path?: string;
}

export default async function add(options: AddOptions) {
  const { type, from, name, path } = options;
  if (!type) {
    throw new CliError(
      ErrorCode.TargetAddNoType,
      `target TYPE is required to add a target (vba-blocks target add TYPE).`
    );
  }

  const project = await loadProject();
  const dependencies = await fetchDependencies(project);

  await addTarget(type, { project, dependencies }, { from, name, path });
}
