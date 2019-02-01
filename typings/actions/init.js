import env from '../env';
import { basename, extname, join } from '../utils/path';
import { pathExists, ensureDir, writeFile } from '../utils/fs';
import { init as git_init } from '../utils/git';
import { writeManifest } from '../manifest';
import { initProject } from '../project';
import addTarget from '../targets/add-target';
import { fromNotFound, initNameRequired, initAlreadyInitialized, initTargetRequired } from '../errors';
export default async function init(options) {
    let { name, dir = env.cwd, target: target_type, from, pkg: as_package, git } = options;
    if (await pathExists(join(dir, 'vba-block.toml'))) {
        throw initAlreadyInitialized();
    }
    if (from && !(await pathExists(from))) {
        throw fromNotFound(from);
    }
    name = name || (from ? basename(from, extname(from)) : basename(dir));
    if (!name) {
        throw initNameRequired();
    }
    if (!target_type && !from && name.includes('.')) {
        const parts = name.split('.');
        target_type = parts.pop();
        name = parts.join('.');
    }
    if (!as_package && !target_type && !from) {
        throw initTargetRequired();
    }
    await ensureDir(join(dir, 'src'));
    if (git && !(await pathExists(join(dir, '.git')))) {
        await git_init(dir);
        await writeFile(join(dir, '.gitignore'), `/build`);
        await writeFile(join(dir, '.gitattributes'), `* text=auto\n*.bas text eol=crlf\n*.cls text eol=crlf`);
    }
    const project = await initProject(name, dir, {
        type: as_package ? 'package' : 'project'
    });
    if (from) {
        target_type = extname(from).replace('.', '');
    }
    if (target_type) {
        const dependencies = [];
        await addTarget(target_type, { project, dependencies }, { from, __temp__log_patch: false });
    }
    await writeManifest(project.manifest, project.paths.dir);
}
