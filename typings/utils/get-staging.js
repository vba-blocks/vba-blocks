import { homedir } from 'os';
import { ensureDirSync } from './fs';
import { join } from './path';
export default function getStaging(cache) {
    const staging = process.platform === 'win32'
        ? join(cache, 'staging')
        : join(findMacOfficeContainer(), '.vba-blocks');
    ensureDirSync(staging);
    return staging;
}
function findMacOfficeContainer() {
    // TODO This is potentially brittle, use search in the future
    // e.g. readdirSync(Group Containers) -> look for *.Office
    return join(homedir(), 'Library/Group Containers/UBF8T346G9.Office');
}
