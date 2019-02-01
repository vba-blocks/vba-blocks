import { validRange } from 'semver';
export function isValid(value) {
    return !!value && validRange(value) != null;
}
