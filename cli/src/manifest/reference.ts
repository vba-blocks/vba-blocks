import * as assert from 'assert';
import { isString } from '../utils';

const VERSION_REGEX = /^(\d+)\.(\d+)$/;
const GUID_REGEX = /\{.{8}-.{4}-.{4}-.{4}-.{12}\}/;

const isVersion = (value: any) => VERSION_REGEX.test(value);
const isGuid = (value: any) => GUID_REGEX.test(value);

export interface Reference {
  name: string;
  version: string;
  guid: string;
  optional?: boolean;
}

export function parseReferences(value: any): Reference[] {
  return Object.entries(value).map(([name, value]) =>
    parseReference(name, value)
  );
}

export function parseReference(name: string, value: any): Reference {
  const { version, guid, optional = false } = value;

  assert.ok(
    isVersion(version),
    `Reference "${name}" has an invalid version "${version}". "version" is required and should look like 'version = "#.#"'.`
  );
  assert.ok(
    isGuid(guid),
    `Reference "${name}" has an invalid guid "${guid}". "guid" is required and should look like 'guid = "{########-####-####-####-############}"'`
  );

  return { name, version, guid, optional };
}
