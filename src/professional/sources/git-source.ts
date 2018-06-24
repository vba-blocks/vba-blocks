import { sourceUnsupported } from '../../errors';
import { Source } from '../../sources/source';
import { Dependency } from '../../manifest';
import { Registration } from '../../sources/registration';

export default class GitSource implements Source {
  resolve(dependency: Dependency): Registration[] {
    throw sourceUnsupported('git');
  }
  fetch(registration: Registration): string {
    throw sourceUnsupported('git');
  }
}
