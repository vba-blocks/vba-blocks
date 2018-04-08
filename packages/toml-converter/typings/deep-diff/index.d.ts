declare module 'deep-diff' {
  export type Index = string | number;
  export type Path = Index[];

  export interface Change {
    kind:
      | 'N' // New
      | 'D' // Deleted
      | 'E' // Edited
      | 'A'; // Array
    path?: Path;
    lhs?: any;
    rhs?: any;
    index?: number;
    item?: Change;
  }

  export function diff(
    lhs: any,
    rhs: any,
    prefilter?: (path: Path, key: Index) => any
  ): Change[];
}
