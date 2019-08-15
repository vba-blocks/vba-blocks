import { Reference } from '../manifest/reference';
import { Source } from '../manifest/source';
import { Component } from './component';

export interface BuildGraph {
  name: string;
  components: Component[];
  references: Reference[];
}

export interface ImportGraph {
  name: string;
  components: Source[];
  references: Reference[];
}
