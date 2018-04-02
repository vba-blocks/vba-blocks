import { ok } from 'assert';

export interface Feature {
  name: string;
  src: string[];
  dependencies: string[];
  references: string[];
}

const EXAMPLE = `Example vba-block.toml:

  [features]
  default = ["a", "b"]

  a = { src = ["A"] }
  b = { dependencies = ["B"] }
  c = { references = ["C"] }`;

export function parseFeatures(
  value: any
): { features: Feature[]; defaultFeatures: string[] } {
  let defaultFeatures: string[] = [];
  let features: Feature[] = [];

  Object.entries(value).forEach(([name, value]) => {
    if (name === 'default') defaultFeatures = <string[]>value;
    else features.push(parseFeature(name, value));
  });

  return { features, defaultFeatures };
}

export function parseFeature(name: string, value: any): Feature {
  const {
    src = [],
    dependencies = [],
    references = []
  }: { src?: string[]; dependencies?: string[]; references?: string[] } = value;

  ok(
    Array.isArray(src),
    `Feature "${name}" has invalid src (must be an array). ${EXAMPLE}`
  );
  ok(
    Array.isArray(dependencies),
    `Feature "${name}" has invalid dependencies (must be an array). ${EXAMPLE}`
  );
  ok(
    Array.isArray(references),
    `Feature "${name}" has invalid references (must be an array). ${EXAMPLE}`
  );

  return { name, src, dependencies, references };
}
