import { Source, Reference } from '../manifest';
import { Component } from './component';

export interface BuildGraph {
  name: string;
  components: Component[];
  references: Reference[];
}
