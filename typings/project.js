import env from './env';
import { join, normalize } from './utils/path';
import { tmpFolder } from './utils/fs';
import parallel from './utils/parallel';
import { loadConfig } from './config';
import { loadManifest } from './manifest';
import { loadWorkspace } from './workspace';
import { fetch } from './sources';
import resolve from './resolve';
import { readLockfile, isLockfileValid } from './lockfile';
import { fetchingDependencies } from './messages';
const debug = require('debug')('vba-blocks:project');
/**
 * Load project from given directory / cwd
 *
 * 1. Load manifest in dir
 * 2. Load workspace from manifest
 * 3. Load lockfile
 * 4. Resolve dependencies
 */
export async function loadProject(dir = env.cwd) {
    const manifest = await loadManifest(dir);
    const config = await loadConfig();
    const workspace = await loadWorkspace(manifest);
    const lockfile = await readLockfile(workspace.root.dir);
    // Resolve packages from lockfile or from sources
    const has_dirty_lockfile = !lockfile || !(await isLockfileValid(lockfile, workspace));
    debug(!has_dirty_lockfile ? 'Loading packages from lockfile' : 'Resolving packages');
    const packages = !has_dirty_lockfile
        ? lockfile.packages
        : await resolve(config, workspace, lockfile ? lockfile.packages : []);
    const paths = {
        root: workspace.root.dir,
        dir: manifest.dir,
        build: join(manifest.dir, 'build'),
        backup: join(manifest.dir, 'build', '.backup'),
        staging: await tmpFolder({ dir: env.staging })
    };
    return {
        manifest,
        workspace,
        packages,
        config,
        paths,
        has_dirty_lockfile
    };
}
/**
 * Fetch all dependencies for project
 * (based on already resolved project.packages)
 *
 * After sources complete fetches, manifests are loaded and returned for each package
 */
export async function fetchDependencies(project) {
    const manifests = await parallel(project.packages, async (registration) => {
        const path = await fetch(project.config.sources, registration);
        const manifest = await loadManifest(path);
        return manifest;
    }, { progress: env.reporter.progress(fetchingDependencies()) });
    return manifests;
}
/**
 * Initialize new project
 *
 * Minimum requirements: name and dir
 */
export async function initProject(name, dir, options = {}) {
    dir = normalize(dir);
    const { type = 'project' } = options;
    const config = await loadConfig();
    // TODO load defaults from config
    const version = '0.0.0';
    const authors = [];
    const license = 'UNLICENSED';
    const __temp_defaults = type === 'package' ? [] : ['publish'];
    // Manually generate manifest and project
    // (may be included in project in the future)
    const manifest = {
        type,
        name,
        version,
        metadata: {
            authors,
            publish: type === 'package',
            license,
            __temp_defaults
        },
        dependencies: [],
        src: [],
        references: [],
        dir
    };
    const workspace = await loadWorkspace(manifest);
    const project = {
        manifest,
        workspace,
        packages: [],
        config,
        paths: {
            root: workspace.root.dir,
            dir,
            build: join(dir, 'build'),
            backup: join(dir, 'build', '.backup'),
            staging: await tmpFolder({ dir: env.staging })
        },
        has_dirty_lockfile: true
    };
    return project;
}
