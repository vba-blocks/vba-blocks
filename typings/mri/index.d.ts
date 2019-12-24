declare module 'mri' {
  export interface Options {
    alias: any;
    boolean: string | string[];
    default: any;
    string: string | string[];
    unknown: (flag: string) => void;
  }
  export interface Args {
    _: string[];
    [key: string]: undefined | boolean | number | string | string[];
  }

  export default function mri(argv: string[], options?: any): Args;
}
