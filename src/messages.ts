import { Messages } from './reporter';
import env from './env';

export type MessageId = keyof Messages;

// Messages

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
