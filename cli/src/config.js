const { join } = require('path');

class Config {
  constructor(values) {
    this.cwd = values.cwd;
    this.build = values.build;
    this.scripts = values.scripts;
    this.addins = values.addins;
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

  static async load() {
    const cwd = process.cwd();
    const build = join(cwd, 'build');
    const scripts = join(__dirname, '../scripts');
    const addins = join(__dirname, '../../addin/build');

    const config = new Config({
      cwd,
      build,
      scripts,
      addins
    });

    return config;
  }
}

module.exports = Config;
