import * as assert from 'assert';

declare module 'assert' {
  export function ok(value: any, message?: string | Error): void;
}
