import { join, relative } from 'path';
import { graceful as detectNewline } from 'detect-newline';
import { readFile, writeFile, unixPath } from '../utils';
import { Source } from './source';
import { Dependency } from './dependency';
import { Manifest } from './';

export interface OperationDetails {
  type: string;
  run: (manifest: Manifest, lines: string[]) => string[];
}
export interface AddSrc extends OperationDetails {
  type: 'add-src';
  source: Source;
}
export interface RemoveSrc extends OperationDetails {
  type: 'remove-src';
  source: Source;
}
export interface AddDependency extends OperationDetails {
  type: 'add-dependency';
  dependency: Dependency;
}
export interface RemoveDependency extends OperationDetails {
  type: 'remove-dependency';
  dependency: Dependency;
}
export type Operation = AddSrc | RemoveSrc | AddDependency | RemoveDependency;

export default async function editManifest(
  manifest: Manifest,
  operations: Operation[]
) {
  const file = join(manifest.dir, 'vba-block.toml');
  const raw = (await readFile(file)).toString();

  let lines = raw.replace(/\r/g, '').split('\n');
  const newline = detectNewline(raw);

  for (const operation of operations) {
    lines = operation.run(manifest, lines);
  }

  const data = lines.join(newline);
  await writeFile(file, data);
}

const isNotSrc = /^\[(?!src).*/g;

export function addSrc(source: Source): AddSrc {
  const run = (manifest: Manifest, lines: string[]) => {
    const relative_path = unixPath(relative(manifest.dir, source.path));
    const add = [
      `${source.name} = ${
        source.optional
          ? `{ path = "${relative_path}", optional = true }`
          : `"${relative_path}"`
      }`,
      ''
    ];

    const src_index = findOrAddSection(lines, 'src');
    const next_index = findAfter(lines, line => isNotSrc.test(line), src_index);
    const insert_index = next_index > src_index ? next_index : lines.length;

    if (lines[insert_index - 1] !== '') add.unshift('');
    insertLines(lines, add, insert_index);

    return lines;
  };

  return { type: 'add-src', source, run };
}

export function removeSrc(source: Source): RemoveSrc {
  const run = (manifest: Manifest, lines: string[]) => {
    const src_index = findSection(lines, 'src');
    if (src_index < 0) {
      throw new Error(
        `Failed to remove "${source.name}", [src] section not found in manifest`
      );
    }

    let remove_index = lines.findIndex(
      line => line.trim() === `[src.${source.name}]`
    );
    if (remove_index > src_index) {
      // TODO

      return lines;
    }

    const next_index = findAfter(lines, line => isNotSrc.test(line), src_index);
    const isMatch = new RegExp(`^${source.name}`);
    remove_index = lines.slice(src_index).findIndex(line => isMatch.test(line));

    if (remove_index <= 0 || (next_index > 0 && remove_index > next_index)) {
      throw new Error(`Failed to remove "${source.name}", not found`);
    }

    // TODO

    return lines;
  };

  return { type: 'remove-src', source, run };
}

export function addDependency(dependency: Dependency): AddDependency {
  const run = (manifest: Manifest, lines: string[]) => {
    // TODO
    return lines;
  };

  return { type: 'add-dependency', dependency, run };
}

export function removeDependency(dependency: Dependency): RemoveDependency {
  const run = (manifest: Manifest, lines: string[]) => {
    // TODO
    return lines;
  };

  return { type: 'remove-dependency', dependency, run };
}

function findOrAddSection(lines: string[], section: string): number {
  section = `[${section}]`;
  let index = lines.findIndex(line => line.trim() === section);
  if (index < 0) {
    if (lines[lines.length - 1] !== '') lines.push('');
    lines.push(section);
    lines.push('');

    index = lines.length - 2;
  }

  return index;
}

function findSection(lines: string[], section: string): number {
  section = `[${section}]`;
  return lines.findIndex(line => line.trim() === section);
}

function findAfter(
  lines: string[],
  search: (line: string) => boolean,
  index: number
): number {
  const result = lines.slice(index).findIndex(search);
  return result >= 0 ? result + index : -1;
}

function insertLines(lines: string[], toInsert: string[], index?: number) {
  if (!index || index >= lines.length - 1) {
    lines.push(...toInsert);
  } else {
    lines.splice(index, 0, ...toInsert);
  }
}
