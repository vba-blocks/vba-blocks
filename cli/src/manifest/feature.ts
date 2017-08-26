export interface Feature {
  name: string;
  src: string[];
  dependencies: string[];
  references: string[];
}

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
  return { name, src, dependencies, references };
}
