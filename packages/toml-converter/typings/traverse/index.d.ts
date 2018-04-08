declare module 'traverse' {
  export class Traverse {
    paths(): Array<string[]>;
  }

  export default function(obj: any): Traverse;
}
