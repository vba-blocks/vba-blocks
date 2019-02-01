export type Version = string;

export interface DependencyDetails {
  name: string;
  version?: string;
}

export interface RegistryDependency extends DependencyDetails {
  registry: string;
  version: string;
}

export interface PathDependency extends DependencyDetails {
  path: string;
}

export interface GitDependency extends DependencyDetails {
  git: string;
  tag?: string;
  branch?: string;
  rev?: string;
}

export type Dependency = RegistryDependency | PathDependency | GitDependency;

export interface ReferenceDetails {
  dependency?: string;
}

export interface Reference {
  name: string;
  version: string;
  guid: string;
  major: number;
  minor: number;
  optional?: boolean;
  details?: ReferenceDetails;
}

export interface Source {
  name: string;
  path: string;
  binary?: string;
  optional?: boolean;
  original?: string;
}

export type TargetType = 'xlsx' | 'xlsm' | 'xlam';

export interface Target {
  name: string;
  type: TargetType;
  path: string;
  filename: string;
  blank?: boolean;
}

export interface Snapshot {
  name: string;
  version: Version;
  dependencies: Dependency[];
}

export interface Metadata {
  authors: string[];
  publish: boolean;
  [name: string]: any;

  __temp_defaults?: string[];
}

export type ManifestType = 'package' | 'project';

export interface Manifest extends Snapshot {
  type: ManifestType;
  metadata: Metadata;
  src: Source[];
  references: Reference[];
  target?: Target;
  dir: string;
}
