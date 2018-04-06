declare module 'deep-diff' {
  export interface Change {
    kind:
      | 'N' // New
      | 'D' // Deleted
      | 'E' // Edited
      | 'A'; // Array
    path: string[];
    lhs?: any;
    rhs?: any;
    index?: number;
    item?: Change;
  }

  export function diff(lhs: any, rhs: any): Change[];
}
