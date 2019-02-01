import { join, dirname } from './utils/path';
import { ensureDir } from './utils/fs';
import run from './utils/run';
import env from './env';
import { addinUnsupportedType } from './errors';
export const extensions = {
    excel: ['xlsx', 'xlsm', 'xlam']
};
export const addins = {
    excel: join(env.addins, 'vba-blocks.xlam')
};
const byExtension = {};
for (const [application, values] of Object.entries(extensions)) {
    for (const extension of values) {
        byExtension[extension] = application;
    }
}
/**
 * Import graph of src and references into given target
 */
export async function importGraph(project, target, graph, file, options = {}) {
    const { application, addin } = getTargetInfo(project, target);
    const { name, components, references } = graph;
    await run(application, options.addin || addin, 'Build.ImportGraph', JSON.stringify({
        file,
        name,
        src: components,
        references
    }));
}
/**
 * Export src and references from given target
 */
export async function exportTo(project, target, staging, options = {}) {
    const { application, addin, file } = getTargetInfo(project, target);
    await run(application, options.addin || addin, 'Build.ExportTo', JSON.stringify({
        file,
        staging
    }));
}
/**
 * Create a new document at the given path
 */
export async function createDocument(project, target, options = {}) {
    const { application, addin, file: path } = getTargetInfo(project, target, options);
    await ensureDir(dirname(path));
    await run(application, options.addin || addin, 'Build.CreateDocument', JSON.stringify({
        path
    }));
    return path;
}
/**
 * Get application, addin, and file for given target
 */
export function getTargetInfo(project, target, options = {}) {
    const application = extensionToApplication(target.type);
    const addin = addins[application];
    const file = join(options.staging ? project.paths.staging : project.paths.build, target.filename);
    return { application, addin, file };
}
export function extensionToApplication(extension) {
    extension = extension.replace('.', '');
    const application = byExtension[extension];
    if (!application)
        throw addinUnsupportedType(extension);
    return application;
}
