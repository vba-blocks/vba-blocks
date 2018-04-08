import { diff as deepDiff, Index, Path } from 'deep-diff';
import traverse from 'traverse';
import clone from 'clone';

/*
  deep-diff has an admittedly simple approach to handling array changes,
  this adds a system for better determining array moves
  
  1. Walk lhs object and identify arrays
  2. Find removed, added, and moved values
  3. Store change information and apply move/remove operations
  4. Diff modified object to identify remaining changes

  Adds a new kind of change: 'R' (for reorder)

  ```js
  {
    kind: 'R',
    path: ['path', 'to', 'array'],
    indices: [2,1,0]
  }
  ```

  Above = Reorder from [0,1,2] to [2,1,0]
*/

export interface Change {
  kind: 'N' | 'D' | 'E' | 'A' | 'R';
  path?: Path;
  lhs?: any;
  rhs?: any;
  index?: number;
  indices?: number[];
  item?: Change;
}

// There are probably heuristics to identify both moves in the array and object changes,
// but for simplicity an id function is provided to identify values in the array
export type getObjectId = (value: any, path: Path, found_in: any[]) => any;

export default function diff(
  lhs: any,
  rhs: any,
  options: { getId?: getObjectId } = {}
): Change[] {
  const array_changes = diffArray(lhs, rhs, options);
  lhs = applyArrayChanges(lhs, array_changes);

  const deep_changes = deepDiff(lhs, rhs) || [];
  return [...array_changes, ...deep_changes];
}

/*
  [1,2,3,4,5] to [6,4,3,2,6,7]

  1. Remove - [2,3,4] (at index)
  2. Reorder - [4,3,2] (by index)
  3. Add - [4,3,2,6,7] (at index)
*/
function diffArray(
  lhs: any,
  rhs: any,
  options: { getId?: getObjectId }
): Change[] {
  const { getId = (value: any) => value } = options;

  const paths: Path[] = traverse(lhs).paths();
  let changes: Change[] = [];

  for (const path of paths) {
    const previous = get(lhs, path);
    const next = get(rhs, path);

    if (!next || !Array.isArray(previous)) continue;

    const previous_ids = previous.map((value: any) =>
      getId(value, path, previous)
    );
    const next_ids = next.map((value: any) => getId(value, path, next));

    const remove = indexedDifference(previous_ids, next_ids);
    const add = indexedDifference(next_ids, previous_ids);
    const reorder = reordered(
      removeByIndex(previous_ids, remove),
      removeByIndex(next_ids, add)
    );

    remove.forEach(index => changes.push({ kind: 'D', path, index }));
    if (reorder.length) changes.push({ kind: 'R', path, indices: reorder });
    add.forEach(index =>
      changes.push({
        kind: 'A',
        path,
        index,
        item: { kind: 'N', rhs: next[index] }
      })
    );
  }

  return changes;
}

function applyArrayChanges(value: any, changes: Change[]): any {
  value = clone(value);

  for (const change of changes) {
    const { kind, path, index, indices, item } = change;
    const array = get(value, change.path!);
    if (kind === 'D') {
      array.splice(index, 1);
    } else if (kind === 'A') {
      array.splice(index, 0, item!.rhs);
    } else if (kind === 'R') {
      const original = array.slice();
      indices!.forEach((to, from) => (array[to] = original[from]));
    }
  }

  return value;
}

function difference(values: any[], reference: any[]): any[] {
  return values.filter((value: any) => !reference.includes(value));
}

function indexedDifference(values: any[], reference: any[]): number[] {
  return values.reduce((memo: number[], value: any, index: number) => {
    if (!reference.includes(value)) memo.push(index);
    return memo;
  }, []);
}

function removeByIndex(values: any[], to_remove: number[]): any[] {
  return values.filter(
    (value: any, index: number) => !to_remove.includes(index)
  );
}

function reordered(from: any[], to: any[]): number[] {
  const found: boolean[] = [];
  const reorder = from.map((value: any) => {
    let index = to.indexOf(value);
    while (index >= 0 && found[index]) {
      index = to.indexOf(value, index + 1);
    }

    if (index < 0)
      throw new Error(`Could not find moved value "${value}" in destination`);
    found[index] = true;

    return index;
  });

  const noop = reorder.every((to, from) => to === from);

  return noop ? [] : reorder;
}

function get(object: any, path: Path): any {
  for (const part of path) {
    if (!object) return undefined;
    object = object[part];
  }
  return object;
}
