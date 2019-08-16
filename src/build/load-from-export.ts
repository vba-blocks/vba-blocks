import walk from 'walk-sync';
import env from '../env';
import { CliError, ErrorCode } from '../errors';
import { Reference } from '../manifest/reference';
import { pathExists, readFile, readJson } from '../utils/fs';
import parallel from '../utils/parallel';
import { basename, extname, join } from '../utils/path';
import { BuildGraph } from './build-graph';
import { byComponentName, Component, extension_to_type } from './component';

const binary_extensions = ['.frx'];

export default async function loadFromExport(staging: string): Promise<BuildGraph> {
  const files = walk(staging, { directories: false })
    .filter(file => {
      return file !== 'project.json' && !file.startsWith('target') && !file.startsWith('staged');
    })
    .map(file => join(staging, file));
  const { name, references } = await readInfo(staging);

  const binaries: { [name: string]: string } = {};
  const to_components = files.filter(file => {
    // Binaries are part of a component
    // Remove from files to be converted and add to component
    if (!isBinary(file)) return true;

    const name = getName(file);
    binaries[name] = file;

    return false;
  });

  const components = await parallel(
    to_components,
    async file => {
      const name = getName(file);
      const type = extension_to_type[extname(file)];
      const code = await readFile(file);
      const binary = <Buffer | undefined>(binaries[name] && (await readFile(binaries[name])));

      if (!type) {
        throw new CliError(
          ErrorCode.ComponentUnrecognized,
          `Unrecognized component extension "${extname(file)}" (at "${file}").`
        );
      }

      return new Component(type, code, { binary });
    },
    { progress: env.reporter.progress('Loading exported components') }
  );
  components.sort(byComponentName);

  return {
    name,
    components,
    references,
    from_dependencies: {
      components: new Map(),
      references: new Map()
    }
  };
}

interface ProjectInfo {
  name: string;
  references: Reference[];
}

async function readInfo(staging: string): Promise<ProjectInfo> {
  const path = join(staging, 'project.json');
  if (!(await pathExists(path))) return { name: 'VBAProject', references: [] };

  const info = await readJson(path);

  return info;
}

function isBinary(file: string): boolean {
  return binary_extensions.includes(extname(file));
}

function getName(file: string): string {
  return basename(file, extname(file));
}
