import env from './env';
export const buildLoadingProject = () => generateMessage('build-project-loading', {});
export const buildBuildingTarget = (target, project, dependencies) => generateMessage('build-target-building', { target, project, dependencies });
export const buildWritingLockfile = (skipped) => generateMessage('build-lockfile-writing', { skipped });
export const exportLoadingProject = () => generateMessage('export-project-loading', {});
export const exportToStaging = (target) => generateMessage('export-to-staging', { target });
export const exportToProject = () => generateMessage('export-to-project', {});
export const updatingProject = () => generateMessage('project-updating', {});
export const resolvingDependencies = () => generateMessage('dependencies-resolving', {});
export const fetchingDependencies = () => generateMessage('dependencies-fetching', {});
export const loadingExport = () => generateMessage('export-loading', {});
export const patchApplyChanges = () => generateMessage('patch-apply-changes', {});
export const patchAddSrc = () => generateMessage('patch-add-src', {});
export const patchRemoveSrc = (name) => generateMessage('patch-remove-src', { name });
export const patchAddDependency = () => generateMessage('patch-add-dependency', {});
export const patchRemoveDependency = (name) => generateMessage('patch-remove-dependency', { name });
export const patchAddReference = () => generateMessage('patch-add-reference', {});
export const patchRemoveReference = (name) => generateMessage('patch-remove-reference', { name });
// Utils
function generateMessage(id, values) {
    const message = env.reporter.messages[id];
    return message(values);
}
