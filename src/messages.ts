import { Messages } from './reporter';
import env from './env';
import { Target } from './manifest';
import { Project } from './project';

export type MessageId = keyof Messages;

// Messages

export const buildLoadingProject = () =>
  generateMessage('build-project-loading', {});

export const buildBuildingTarget = (
  target: Target,
  project: Project,
  dependencies: string[]
) =>
  generateMessage('build-target-building', { target, project, dependencies });

export const buildWritingLockfile = (skipped: boolean) =>
  generateMessage('build-lockfile-writing', { skipped });

export const exportLoadingProject = () =>
  generateMessage('export-project-loading', {});

export const exportToStaging = (target: Target) =>
  generateMessage('export-to-staging', { target });

export const exportToProject = () => generateMessage('export-to-project', {});

export const updatingProject = () => generateMessage('project-updating', {});

export const resolvingDependencies = () =>
  generateMessage('dependencies-resolving', {});

export const fetchingDependencies = () =>
  generateMessage('dependencies-fetching', {});

export const loadingExport = () => generateMessage('export-loading', {});

export const patchApplyChanges = () =>
  generateMessage('patch-apply-changes', {});

export const patchAddSrc = () => generateMessage('patch-add-src', {});

export const patchRemoveSrc = (name: string) =>
  generateMessage('patch-remove-src', { name });

export const patchAddDependency = () =>
  generateMessage('patch-add-dependency', {});

export const patchRemoveDependency = (name: string) =>
  generateMessage('patch-remove-dependency', { name });

// Utils

function generateMessage<T extends MessageId>(
  id: T,
  values: Messages[T]
): string {
  type Message = (values: Messages[T]) => string;
  const message = <Message>env.reporter.messages[id];

  return message(values);
}
