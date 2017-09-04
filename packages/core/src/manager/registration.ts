import { Manifest, Version, Dependency } from '../manifest';

export interface Registration {
  name: string;
  version: Version;
  dependencies: Dependency[];
  features: { [name: string]: string[] };
  source: string;
}

export function fromManifest(manifest: Manifest, source: string): Registration {
  const features = {};
  for (const feature of manifest.features) {
    features[feature.name] = feature.dependencies;
  }

  return {
    name: manifest.metadata.name,
    version: manifest.metadata.version,
    dependencies: manifest.dependencies,
    features,
    source
  };
}

export function getRegistrationId(registration: Registration): string {
  return `${registration.name}@${registration.version}`;
}
