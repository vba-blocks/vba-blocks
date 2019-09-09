import env from '../env';
import run from './run-macro';

export interface TestOptions {
  target?: string;
  args: string[];
}

export default async function test(options: TestOptions) {
  const { target, args } = options;
  const macro = 'Tests.Run';
  const stdout = env.isWindows ? 'CON' : '/dev/stdout';

  await run({ target, macro, args: [stdout, ...args] });
}
