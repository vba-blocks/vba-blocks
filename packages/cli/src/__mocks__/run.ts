import { Config } from '../config';
import { Target } from '../manifest';

async function run(
  config: Config,
  target: Target,
  command: string,
  ...args: any[]
): Promise<any> {}

export default jest.fn(run);
