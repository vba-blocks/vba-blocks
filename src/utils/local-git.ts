import { execFile } from 'child_process';
import commandExists from 'command-exists';
import env from '../env';
import { ensureDir } from './fs';
import { dirname } from './path';

const debug = env.debug('vba-blocks:local-git');

export async function isAvailable() {
  return await commandExists('git');
}

export interface CloneOptions {
  dir: string;
  url: string;
  depth?: number;
}

export async function clone({ dir, url, depth }: CloneOptions) {
  debug(`clone ${url} ${dir} (depth = ${depth})`);

  await ensureDir(dirname(dir));

  const depthArgs = depth ? ['--depth', String(depth)] : [];
  await execGit(process.cwd(), ['clone', url, dir, ...depthArgs]);
}

export interface PullOptions {
  dir: string;
}

export async function pull({ dir }: PullOptions) {
  debug(`pull (${dir})`);

  await execGit(dir, ['pull']);
}

export interface InitOptions {
  dir: string;
}

export async function init({ dir }: InitOptions) {
  debug(`init (${dir})`);

  await execGit(dir, ['init']);
}

export interface AddAllOptions {
  dir: string;
}

export async function addAll({ dir }: AddAllOptions) {
  debug(`add -A (${dir})`);

  await execGit(dir, ['add', '-A']);
}

export interface CommitOptions {
  dir: string;
  message: string;
}

export async function commit({ dir, message }: CommitOptions) {
  debug(`commit -m "${message}" (${dir})`);

  await execGit(dir, ['commit', '-m', message]);
}

export interface TagOptions {
  dir: string;
  ref: string;
  sign: boolean;
}

export async function tag({ dir, ref, sign }: TagOptions) {
  debug(`tag "${ref}"`);

  const signArgs = sign ? ['-s'] : [];
  await execGit(dir, ['tag', ...signArgs, ref]);
}

export interface PushOptions {
  dir: string;
}

export async function push({ dir }: PushOptions) {
  debug(`push (${dir})`);

  await execGit(dir, ['push']);
}

interface ExecResult {
  stdout: string | Buffer;
  stderr: string | Buffer;
}

async function execGit(dir: string, args: string[]): Promise<ExecResult> {
  return new Promise((resolve, reject) => {
    execFile('git', args, (error, stdout, stderr) => {
      if (error) return reject(error);
      resolve({ stdout, stderr });
    });
  });
}
