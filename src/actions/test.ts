import env from '../env';
import run from './run';

export interface TestOptions {
  target?: string;
}

export default async function test(options: TestOptions) {
  const { target } = options;
  const macro = 'Tests.Run';
  const stdout = env.isWindows ? 'CON' : '/dev/stdout';

  await run({ target, macro, args: [stdout] });
}
