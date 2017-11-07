import env from '../env';
import { Source } from './source';
import { Dependency } from '../manifest';
import { Registration } from './registration';

export default class UnsupportedSource implements Source {
  id: 'unsupported-git' | 'unsupported-path';
  constructor(type: string) {
    this.id = type === 'git' ? 'unsupported-git' : 'unsupported-path';
  }

  resolve(dependency: Dependency): Registration[] {
    throw env.reporter.error(this.id);
  }
  fetch(registration: Registration): string {
    throw env.reporter.error(this.id);
  }
}
