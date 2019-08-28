import { manifestOk } from '../errors';

/*
  # Reference

  To add reference, guid, major version, and minor version are required

  reference: { guid, version }

  Where version is "MAJOR.MINOR"
*/

export interface ReferenceDetails {
  dependency?: string;
}

export interface Reference {
  name: string;
  guid: string;
  major: number;
  minor: number;
}

const VERSION_REGEX = /^(\d+)\.(\d+)$/;
const GUID_REGEX = /\{.{8}-.{4}-.{4}-.{4}-.{12}\}/;

const isVersion = (value: string) => VERSION_REGEX.test(value);
const isGuid = (value: string) => GUID_REGEX.test(value);

const toInt = (value: string) => parseInt(value, 10);
const getMajorMinor = (version: string) => {
  const [major, minor] = version.split('.', 2).map(toInt);

  return { major, minor };
};

const EXAMPLE = `Example vba-block.toml:

  [references.Scripting]
  version = "1.0"
  guid = "{420B2830-E718-11CF-893D-00A0C9054228}"`;

export function parseReferences(value: any): Reference[] {
  return Object.entries(value).map(([name, value]) => parseReference(name, value));
}

export function parseReference(name: string, value: any): Reference {
  const { version, guid } = value;

  manifestOk(
    isVersion(version),
    `Reference "${name}" has an invalid version "${version}". \n\n${EXAMPLE}.`
  );
  manifestOk(isGuid(guid), `Reference "${name}" has an invalid guid "${guid}". \n\n${EXAMPLE}'`);

  const { major, minor } = getMajorMinor(version);

  return { name, guid, major, minor };
}
