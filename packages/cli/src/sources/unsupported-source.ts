import { unsupportedSource } from '../errors';
import { Source } from './source';
import { Dependency } from '../manifest';
import { Registration } from './registration';

export default class UnsupportedSource implements Source {
  type: string;
  constructor(type: string) {
    this.type = type;
  }

  resolve(dependency: Dependency): Registration[] {
    throw unsupportedSource(this.type);
  }
  fetch(registration: Registration): string {
    throw unsupportedSource(this.type);
  }
}
