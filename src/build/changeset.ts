import { Reference } from '../manifest/reference';
import { Component } from './component';

export interface Changeset {
  components: {
    added: Component[];
    changed: Component[];
    removed: Component[];
  };
  references: {
    added: Reference[];
    changed: Reference[];
    removed: Reference[];
  };
}
