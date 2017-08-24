const { exists, read } = require('fs-extra');
const { join } = require('path');
const assert = require('assert');
const toml = require('toml');
const { mapObject, isString } = require('./utils');

class Manifest {
  constructor(values) {
    assert(values, 'No values were supplied for the manifest');

    const { package: pkg, src = {}, dependencies = {}, targets = [] } = values;

    assert(
      pkg,
      '[package] is a required field, with name, version, and authors specified'
    );
    assert(pkg.name, '[package] name is a required field');
    assert(pkg.version, '[package] version is a required field');
    assert(pkg.authors, '[package] authors is a required field');

    this.metadata = {
      name: pkg.name,
      version: pkg.version,
      authors: pkg.authors
    };

    this.src = mapObject(src, (details, name) => {
      if (isString(details)) details = { path: details };

      const src = Object.assign(details, { name });
      return src;
    });

    this.dependencies = mapObject(dependencies, (details, name) => {
      if (isString(details)) details = { version: details };

      const dependency = Object.assign(details, { name });
      return dependency;
    });

    this.targets = targets.map(target => {
      if (!target.name) {
        target.name = pkg.name;
      }

      return target;
    });
  }

  static async load(dir) {
    const file = join(dir, 'vba-block.toml');
    if (!await exists(file)) {
      throw new Error(`vba-blocks.toml not found in "${dir}"`);
    }

    const data = read(file);
    const parsed = toml.parse(data);
    const manifest = new Manifest(parsed);

    return manifest;
  }
}

module.exports = Manifest;
