import { join } from 'path';
import { pathExists } from 'fs-extra';
import { Config } from '../config';
import { Target, Source, Reference } from '../manifest';
import run from '../run';

export default async function buildTarget(
  config: Config,
  target: Target,
  graph: { src: Source[]; references: Reference[] }
) {
  const file = join(config.build, `${target.name}.${target.type}`);
  if (!await pathExists(file)) {
    throw new Error(
      `Target binary for ${target.name}.${target.type} not found`
    );
  }

  await run(config, target, 'import', graph);
}
