import { normalize } from 'path';
import env from '../env';
import exec from './exec';
import { CliError } from '../errors';
import { homedir } from 'os';
import { join } from '../utils/path';
import { readFile, writeFile } from '../utils/fs';
import { pathExists } from 'fs-extra';

export async function addToPATH() {
  if (env.isWindows) {
    try {
      const bin = normalize(env.bin);
      await exec(['add-to-path', bin]);
    } catch (underlying) {
      throw new CliError('Failed to add vba-blocks to PATH.', { underlying });
    }
  } else {
    // Add bin to ~/.profile and ~/.bash_profile (if it exists)
    const profile = join(homedir(), '.profile');
    const bash = join(homedir(), '.bash_profile');
    const profiles = [profile];
    if (await pathExists(bash)) profiles.push(bash);

    await Promise.all(profiles.map(addToProfile));
  }
}

export async function removeFromPATH() {
  if (env.isWindows) {
    try {
      await exec(['remove-from-path', normalize(env.bin)]);
    } catch (underlying) {
      throw new CliError('Failed to remove vba-blocks from PATH.', {
        underlying
      });
    }
  } else {
    const profile = join(homedir(), '.profile');
    const bash = join(homedir(), '.bash_profile');
    const profiles = [profile];
    if (await pathExists(bash)) profiles.push(bash);

    await Promise.all(profiles.map(removeFromProfile));
  }
}

export async function addToProfile(profile: string) {
  const path = `export PATH="${env.bin}:$PATH"`;
  let file = (await pathExists(profile))
    ? await readFile(profile, 'utf-8')
    : '';

  if (file.includes(path)) return;

  file += `\n${path}`;
  await writeFile(profile, file);
}

export async function removeFromProfile(profile: string) {
  if (!(await pathExists(profile))) return;

  const path = `export PATH="${env.bin}:$PATH"`;

  let file = await readFile(profile, 'utf-8');
  const index = file.indexOf(path);

  if (index < 0) return;

  file = file.substr(0, index) + file.substr(index + path.length);
  await writeFile(profile, file);
}
