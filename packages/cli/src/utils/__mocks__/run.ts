import { Config } from '../../config';

async function run(
  config: Config,
  application: string,
  addin: string,
  command: string,
  value: object
): Promise<any> {}

export default jest.fn(run);
