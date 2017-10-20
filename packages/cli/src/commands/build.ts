import { Command, Options } from './command';
import { Config } from '../config';
import { BuildOptions } from '../actions/build';

type Build = (options: BuildOptions) => Promise<void>;

const build: Command = {
  description: 'Build project from manifest',
  async action(options: Options) {
    const build: Build = require('../actions/build').default;
    await build(options);
  }
};

export default build;
