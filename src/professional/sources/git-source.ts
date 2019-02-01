import { sourceUnsupported } from '../../errors';

import { Source, Registration } from '../../sources/types';
import { Dependency } from '../../manifest/types';

export default class GitSource implements Source {
  resolve(dependency: Dependency): Registration[] {
    throw sourceUnsupported('git');
  }
  fetch(registration: Registration): string {
    throw sourceUnsupported('git');
  }
}
