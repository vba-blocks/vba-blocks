const path = require('path');

class Config {
  constructor(values) {
    this.cwd = values.cwd;
    this.build = values.build;
    this.scripts = values.scripts;
    this.addins = values.addins;
  }

  relativeToCwd(file) {
    return path.join(this.cwd, file);
  }

  relativeToBuild(file) {
    return path.join(this.build, file);
  }

  relativeToScripts(file) {
    return path.join(this.scripts, file);
  }

  relativeToAddins(file) {
    return path.join(this.addins, file);
  }

  static load() {
    return new Promise((resolve, reject) => {
      let config;
      try {
        const cwd = process.cwd();
        const build = path.join(cwd, 'build');
        const scripts = path.join(__dirname, '../scripts');
        const addins = path.join(__dirname, '../../addin/build');
        
        config = new Config({
          cwd,
          build,
          scripts,
          addins,
        });
      } catch(err) {
        return reject(err);
      }

      resolve(config);
    });
  }
}

module.exports = Config;
