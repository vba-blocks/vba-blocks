const toString = Object.prototype.toString;
export function isString(value) {
    return typeof value === 'string';
}
export function isDate(value) {
    return toString.call(value) === '[object Date]';
}
export function isNumber(value) {
    return typeof value === 'number';
}
export function isBoolean(value) {
    return typeof value === 'boolean';
}
export function isObject(value) {
    return value != null && typeof value === 'object';
}
