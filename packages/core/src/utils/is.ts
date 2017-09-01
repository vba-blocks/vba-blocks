const toString = Object.prototype.toString;

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

export function isObject(value: any): boolean {
  return value != null && typeof value === 'object';
}
