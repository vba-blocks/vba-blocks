import { join } from 'path';
import { exists, readFile, writeFile } from 'fs-extra';
import { parse as parseToml } from 'toml';
import { Config } from '../config';
import { convertToToml } from '../utils';
import { DependencyGraph } from './dependency-graph';

export async function readLockfile(
  config: Config
): Promise<DependencyGraph | null> {
  const file = join(config.cwd, 'vba-block.lock');
  if (!await exists(file)) return null;

  const raw = await readFile(file);
  const graph = parseToml(raw);

  return graph;
}

export async function writeLockfile(
  config: Config,
  graph: DependencyGraph
): Promise<void> {
  const file = join(config.cwd, 'vba-block.lock');
  const converted = convertToToml(graph);
  return writeFile(file, converted);
}
