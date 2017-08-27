import { IGitResult, GitProcess } from 'dugite';

export interface ExecResult extends IGitResult {}

export async function clone(
  remote: string,
  name: string,
  cwd: string
): Promise<ExecResult> {
  return GitProcess.exec(['clone', '--depth', '1', remote, name], cwd);
}

export async function pull(local: string): Promise<ExecResult> {
  return GitProcess.exec(['pull'], local);
}
