export { default as cleanError } from './clean-error';
export { default as convertToToml } from './convert-to-toml';
export { default as download } from './download';
export * from './fs';
export * from './git';
export { default as optionList } from './option-list';
export { default as parallel } from './parallel';
export { default as run, escape } from './run';
export { default as unixPath } from './unix-path';
export * from './zip';

const toString = Object.prototype.toString;

export function has(value: any, key: string): boolean {
  return !!value && value.hasOwnProperty(key);
}

export function isString(value: any): value is string {
  return typeof value === 'string';
}

export function isDate(value: any): value is Date {
  return toString.call(value) === '[object Date]';
}

export function isNumber(value: any): value is number {
  return typeof value === 'number';
}

export function isBoolean(value: any): value is boolean {
  return typeof value === 'boolean';
}

export function isObject(value: any): value is object {
  return value != null && typeof value === 'object';
}

export function last<T>(values: T[]): T | undefined {
  return (
    (values && values.length >= 1 && values[values.length - 1]) || undefined
  );
}

export function unique(values: any) {
  return Array.from(new Set(values));
}
