import { join, dirname } from './path';
import { IGitResult, GitProcess } from 'dugite';
import isPackaged from './is-packaged';

if (isPackaged()) {
  // For packaged, git is included with .exe (not bundled)
  // Pass to dugite with environment variable
  process.env.LOCAL_GIT_DIRECTORY = join(dirname(process.execPath), '../git');
}

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
