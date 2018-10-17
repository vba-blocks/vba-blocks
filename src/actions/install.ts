import { homedir } from 'os';
import { join } from 'path';
import { readFile, pathExists, writeFile, remove, symlink } from '../utils/fs';
import env from '../env';

export async function isInstalled(): Promise<boolean> {
  const profile = join(homedir(), '.profile');
  if (!(await pathExists(profile))) return false;

  const data = await readFile(profile, 'utf8');
  return data.includes('vba-blocks.app/bin');
}

export async function install() {
  console.log(process.execPath);

  const profile = join(homedir(), '.profile');
  const bash_profile = join(homedir(), '.bash_profile');

  await addExport(profile);
  if (await pathExists(bash_profile)) await addExport(bash_profile);

  const addins = join(homedir(), 'vba-blocks Add-ins');
  await remove(addins);
  await symlink(env.addins, addins, 'dir');
}

async function addExport(profile: string) {
  const bin = '/Applications/vba-blocks.app/bin';
  const value = `export PATH="$PATH:${bin}"`;

  let data;
  if (await pathExists(profile)) {
    data = await readFile(profile, 'utf8');
    data += `\n${value}`;
  } else {
    data = value;
  }

  await writeFile(profile, data);
}
