import walk from 'walk-sync';
import { Component, extension_to_type, byComponentName } from './component';
import { join, extname, basename } from '../utils/path';
import { pathExists, readJson, readFile } from '../utils/fs';
import parallel from '../utils/parallel';
import env from '../env';
import { CliError, ErrorCode } from '../errors';

import { Reference } from '../manifest/types';
import { BuildGraph } from './types';

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

      // TODO There should be a way to encode this,
      // but for now just rely on project's BuildGraph
      const dependency = undefined;

      if (!type) {
        throw new CliError(
          ErrorCode.ComponentUnrecognized,
          `Unrecognized component extension "${extname(file)}" (at "${file}").`
        );
      }

      return new Component(type, code, { dependency, binary });
    },
    { progress: env.reporter.progress('Loading exported components') }
  );
  components.sort(byComponentName);

  return {
    name,
    components,
    references
  };
}

interface ProjectInfo {
  name: string;
  references: Reference[];
}

async function readInfo(staging: string): Promise<ProjectInfo> {
  const path = join(staging, 'project.json');
  if (!(await pathExists(path))) return { name: 'VBAProject', references: [] };

  const { name, references } = await readJson(path);

  return {
    name,
    references: references.map((reference: Reference) => {
      // TODO There should be a way to encode this,
      // but for now just rely on project's BuildGraph
      reference.details = { dependency: undefined };

      return reference;
    })
  };
}

function isBinary(file: string): boolean {
  return binary_extensions.includes(extname(file));
}

function getName(file: string): string {
  return basename(file, extname(file));
}
