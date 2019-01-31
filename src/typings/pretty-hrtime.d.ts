declare module 'pretty-hrtime' {
  export interface Options {}

  export default function prettyHrtime(source: number[], options?: Options): string;
}
