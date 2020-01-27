declare module 'path-sort' {
  export default function pathSort(paths: string[], separator?: string): string[];
  export function standalone(separator?: string): (a: string, b: string) => 1 | -1 | void;
}
