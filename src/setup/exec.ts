import { execFile } from 'child_process';
import { normalize, join } from 'path';
import env from '../env';
const debug = require('debug')('vba-blocks:native');

export interface Result {
  stdout: string;
  stderr: string;
}

interface ErrorWithCode extends Error {
  code: number | string | undefined;
}

export default async function exec(args: string[]): Promise<Result> {
  return new Promise<Result>((resolve, reject) => {
    const file = normalize(
      join(
        env.native,
        env.isWindows ? 'vba-blocks-native.exe' : 'vba-blocks-native'
      )
    );
    debug('execFile', file, args);

    execFile(file, args, (err, stdout, stderr) => {
      debug(stdout);

      if (!err) return resolve({ stdout, stderr });

      const code = (err as ErrorWithCode).code;
      if (typeof code === 'number') {
        reject(`Failed with code ${code}\n${stdout}\n${stderr}`);
      } else {
        reject(err);
      }
    });
  });
}
