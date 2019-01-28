import { isString, isNumber, isBoolean, isDate, isObject } from './is';

export { parse } from 'toml';
export { toToml as convert } from 'tomlify-j0.4';

export function toLockfile(value: any, level = 0): string {
  if (isString(value)) {
    return `"${value}"`;
  } else if (isNumber(value)) {
    return `${value}`;
  } else if (isBoolean(value)) {
    return value ? 'true' : 'false';
  } else if (isDate(value)) {
    return value.toISOString();
  } else if (isObject(value)) {
    let converted = '';

    if (level === 0) {
      // For top level, use [key] / [[key]] approach
      for (const [key, item] of Object.entries(value)) {
        if (Array.isArray(item)) {
          item.forEach(subitem => {
            converted += `[[${key}]]\n${toLockfile(subitem, level + 1)}\n`;
          });
        } else {
          converted += `[${key}]\n${toLockfile(item, level + 1)}\n`;
        }
      }
    } else if (level === 1) {
      // For next level, use key = value appraoch
      for (const [key, item] of Object.entries(value)) {
        if (Array.isArray(item)) {
          const empty = item.length === 0;
          converted += `${key} = [\n`;
          converted += item.map(subitem => `  ${toLockfile(subitem, level + 1)}`).join(',\n');
          converted += empty ? ']\n' : ',\n]\n';
        } else {
          converted += `${key} = ${toLockfile(item, level + 1)}\n`;
        }
      }
    } else {
      // TODO (not used by lockfile)
    }

    return converted;
  } else {
    throw new Error(
      `Unsupported type passed to toLockfile. Only String, Number, Boolean, Date, Array, and Object are supported`
    );
  }
}
