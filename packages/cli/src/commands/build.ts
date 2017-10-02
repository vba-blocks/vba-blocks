import { Command, Options } from './command';
import { Config } from '../config';
import { BuildOptions } from '../actions/build';

type Build = (config: Config, options: BuildOptions) => Promise<void>;

const build: Command = {
  description: 'Build project from manifest',
  async action(config: Config, options: Options) {
    const build: Build = require('../actions/build').default;
    await build(config, options);
  }
};

export default build;
