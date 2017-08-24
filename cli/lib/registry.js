const { join, normalize } = require('path');
const readline = require('readline');
const { createReadStream, ensureDir, exists } = require('fs-extra');
const { clone, pull } = require('./utils/git');

class Registry {
  constructor(values) {
    this.path = values.path;
  }

  getPath(name) {
    const parts = getParts(name);
    return normalize(join(this.path, ...parts, name));
  }

  async getVersions(name) {
    return new Promise((resolve, reject) => {
      const path = this.getPath(name);
      const versions = [];

      const reader = readline.createInterface({
        input: createReadStream(path)
      });
      reader.on('line', line => versions.push(JSON.parse(line)));
      reader.on('close', () => resolve(versions));
      reader.on('error', reject);
    });
  }

  static async update(config) {
    const local = config.relativeToCache('registry');

    if (!await exists(local)) {
      await ensureDir(config.cache);
      await clone(config.registry, 'registry', config.cache);
    }

    await pull(local);

    return new Registry({ path: local });
  }
}

function getParts(name) {
  if (name.length === 1) {
    return [1, name];
  } else if (name.length === 2) {
    return [2, name];
  } else if (name.length === 3) {
    return [3, name.substring(0, 1)];
  } else {
    return [name.substring(0, 2), name.substring(2, 4)];
  }
}

module.exports = Registry;
