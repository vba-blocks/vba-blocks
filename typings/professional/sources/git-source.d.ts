import { Source, Registration } from '../../sources/types';
import { Dependency } from '../../manifest/types';
export default class GitSource implements Source {
    resolve(dependency: Dependency): Registration[];
    fetch(registration: Registration): string;
}
