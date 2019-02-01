import { sourceUnsupported } from '../../errors';
export default class GitSource {
    resolve(dependency) {
        throw sourceUnsupported('git');
    }
    fetch(registration) {
        throw sourceUnsupported('git');
    }
}
