const path = require('path');
const { homedir } = require('os');

class Config {
  constructor(values) {
    this.cwd = values.cwd;
    this.build = values.build;
    this.scripts = values.scripts;
    this.addins = values.addins;
    this.cache = values.cache;
    this.registry = values.registry;
    this.resolve = values.resolve;
  }

  relativeToCwd(file) {
    return join(this.cwd, file);
  }

  relativeToBuild(file) {
    return join(this.build, file);
  }

  relativeToScripts(file) {
    return join(this.scripts, file);
  }

  relativeToAddins(file) {
    return join(this.addins, file);
  }

  relativeToCache(file) {
    return join(this.cache, file);
  }

  static async load() {
    const cwd = process.cwd();
    const build = join(cwd, 'build');
    const scripts = join(__dirname, '../scripts');
    const addins = join(__dirname, '../../addin/build');
    const cache = join(homedir(), '.vba-blocks');
    const registry = 'https://github.com/vba-blocks/registry.git';
    const resolve = (name, version) =>
      `https://packages.vba-blocks.com/${name}/v${version}.tar.gz`;

    const config = new Config({
      cwd,
      build,
      scripts,
      addins,
      cache,
      registry,
      resolve
    });

    return config;
  }
}

function join(...parts) {
  return path.normalize(path.join(...parts));
}

module.exports = Config;
