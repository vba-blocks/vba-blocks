import { manifestOk } from '../errors';

export interface Reference {
  name: string;
  version: string;
  guid: string;
  major: number;
  minor: number;
  optional?: boolean;
}

const VERSION_REGEX = /^(\d+)\.(\d+)$/;
const GUID_REGEX = /\{.{8}-.{4}-.{4}-.{4}-.{12}\}/;

const isVersion = (value: any) => VERSION_REGEX.test(value);
const isGuid = (value: any) => GUID_REGEX.test(value);

const EXAMPLE = `Example vba-block.toml:

  [references.Scripting]
  version = "1.0"
  guid = "{420B2830-E718-11CF-893D-00A0C9054228}"
  optional = true`;

export function parseReferences(value: any): Reference[] {
  return Object.entries(value).map(([name, value]) => parseReference(name, value));
}

export function parseReference(name: string, value: any): Reference {
  const { version, guid, optional = false } = value;

  manifestOk(
    isVersion(version),
    `Reference "${name}" has an invalid version "${version}". ${EXAMPLE}.`
  );
  manifestOk(isGuid(guid), `Reference "${name}" has an invalid guid "${guid}". ${EXAMPLE}'`);

  const [major, minor] = version.split('.').map((part: string) => parseInt(part, 10));

  return { name, version, guid, major, minor, optional };
}
