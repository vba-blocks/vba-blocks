import env from '../env';
import { join, dirname, basename, sanitize } from '../utils/path';
import download from '../utils/download';
import { checksum as getChecksum, ensureDir, pathExists, move, readFile, tmpFile } from '../utils/fs';
import { clone, pull } from '../utils/git';
import { unzip } from '../utils/zip';
import { getRegistrationId, getRegistrationSource } from './registration';
import { dependencyNotFound, dependencyInvalidChecksum, sourceDownloadFailed } from '../errors';
const debug = require('debug')('vba-blocks:registry-source');
export default class RegistrySource {
    constructor({ name, index, packages }) {
        this.name = name;
        this.local = {
            index: join(env.registry, name),
            packages: join(env.packages, name)
        };
        this.remote = { index, packages };
        this.sources = join(env.sources, name);
        this.up_to_date = false;
    }
    async resolve(dependency) {
        if (!this.up_to_date)
            await this.pull();
        const { name } = dependency;
        const path = getPath(this.local.index, name);
        if (!(await pathExists(path))) {
            throw dependencyNotFound(name, this.name);
        }
        const data = await readFile(path, 'utf8');
        const registrations = data
            .split(/\r?\n/)
            .filter((line) => !!line)
            .map((line) => JSON.parse(line))
            .filter((value) => value && !value.yanked)
            .map((value) => parseRegistration(this.name, value));
        return registrations;
    }
    async fetch(registration) {
        const url = getRemotePackage(this.remote.packages, registration);
        const file = getLocalPackage(this.local.packages, registration);
        const [_, checksum] = registration.source.split('#', 2);
        const [algorithm, hash] = checksum.split('-');
        if (!(await pathExists(file))) {
            const unverifiedFile = await tmpFile();
            try {
                await download(url, unverifiedFile);
            }
            catch (err) {
                throw sourceDownloadFailed(registration.source, err);
            }
            const comparison = await getChecksum(unverifiedFile, algorithm);
            if (comparison !== hash) {
                debug(`Checksum failed for ${unverifiedFile}`);
                debug(`Expected ${hash} (${algorithm}), received ${comparison}`);
                throw dependencyInvalidChecksum(registration);
            }
            await move(unverifiedFile, file);
        }
        const src = getSource(this.sources, registration);
        await ensureDir(src);
        await unzip(file, src);
        return src;
    }
    async pull() {
        if (this.pulling)
            return this.pulling;
        this.pulling = pullIndex(this.local.index, this.remote.index);
        await this.pulling;
        this.up_to_date = true;
        this.pulling = undefined;
    }
}
export async function pullIndex(local, remote) {
    if (!(await pathExists(local))) {
        const dir = dirname(local);
        await ensureDir(dir);
        await clone(remote, basename(local), dir);
    }
    await pull(local);
}
export function parseRegistration(registry, value) {
    const { name, vers: version, cksum: checksum } = value;
    const dependencies = value.deps.map((dep) => {
        const { name, req } = dep;
        const dependency = {
            name,
            registry,
            version: req
        };
        return dependency;
    });
    return {
        id: getRegistrationId(name, version),
        source: getRegistrationSource('registry', registry, checksum),
        name,
        version,
        dependencies
    };
}
export function sanitizePackageName(name) {
    return sanitize(name.replace('/', '--'));
}
function getPath(index, name) {
    return join(index, sanitizePackageName(name));
}
export function getRemotePackage(packages, registration) {
    const { name, version } = registration;
    return `${packages}/${sanitizePackageName(name)}-v${version}.block`;
}
export function getLocalPackage(packages, registration) {
    const { name, version } = registration;
    return join(packages, `${sanitizePackageName(name)}-v${version}.block`);
}
export function getSource(sources, registration) {
    const { name, version } = registration;
    return join(sources, `${sanitizePackageName(name)}-v${version}`);
}
