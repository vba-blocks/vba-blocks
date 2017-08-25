import { IGitResult, GitProcess } from 'dugite';
export { IGitResult } from 'dugite';

export async function clone(
  remote: string,
  name: string,
  cwd: string
): Promise<IGitResult> {
  return GitProcess.exec(['clone', '--depth', '1', remote, name], cwd);
}

export async function pull(local: string): Promise<IGitResult> {
  return GitProcess.exec(['pull'], local);
}
