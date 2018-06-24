import { join, extname, basename } from 'path';
import walk from 'walk-sync';
import { Reference, Source } from '../manifest';
import { BuildGraph } from './build-graph';
import { Component, extensionToType } from './component';
import { pathExists, readJson, readFile, parallel } from '../utils';
import env from '../env';
import { unrecognizedComponent } from '../errors';

const binary_extensions = ['.frx'];

export async function readBuildGraph(staging: string): Promise<BuildGraph> {
  const files = walk(staging, { directories: false }).filter(file => {
    return file !== 'project.json' && !file.startsWith('targets');
  });
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
      const code = await readFile(file);
      const type = extensionToType(extname(file));

      if (!type) {
        throw unrecognizedComponent(file);
      }

      const source: Source = { name, path: file, binary: binaries[name] };
      const binary = <Buffer | undefined>(source.binary &&
        (await readFile(source.binary)));

      return new Component({ code, type, binary, source });
    },
    { progress: env.reporter.progress('Load exported components') }
  );

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

  return await readJson(path);
}

function isBinary(file: string): boolean {
  return binary_extensions.includes(extname(file));
}

function getName(file: string): string {
  return basename(file, extname(file));
}
