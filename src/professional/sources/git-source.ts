import { unsupportedSource } from '../../errors';
import { Source } from '../../sources/source';
import { Dependency } from '../../manifest';
import { Registration } from '../../sources/registration';

export default class GitSource implements Source {
  resolve(dependency: Dependency): Registration[] {
    throw unsupportedSource('git');
  }
  fetch(registration: Registration): string {
    throw unsupportedSource('git');
  }
}
