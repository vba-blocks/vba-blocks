import { Dependency } from '../manifest/types';
import { Source, Registration } from './types';
export default class PathSource implements Source {
    resolve(dependency: Dependency): Promise<Registration[]>;
    fetch(registration: Registration): Promise<string>;
}
