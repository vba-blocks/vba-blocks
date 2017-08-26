import * as assert from 'assert';

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
): { features: Feature[]; default_features: string[] } {
  let default_features = [];
  let features = [];

  Object.entries(value).forEach(([name, value]) => {
    if (name === 'default') default_features = value;
    else features.push(parseFeature(name, value));
  });

  return { features, default_features };
}

export function parseFeature(name: string, value: any): Feature {
  const { src = [], dependencies = [], references = [] } = value;

  assert.ok(
    Array.isArray(src),
    `Feature "${name}" has invalid src (must be an array). ${EXAMPLE}`
  );
  assert.ok(
    Array.isArray(dependencies),
    `Feature "${name}" has invalid dependencies (must be an array). ${EXAMPLE}`
  );
  assert.ok(
    Array.isArray(references),
    `Feature "${name}" has invalid references (must be an array). ${EXAMPLE}`
  );

  return { name, src, dependencies, references };
}
