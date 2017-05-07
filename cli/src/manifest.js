const fs = require('fs');
const path = require('path');
const assert = require('assert');
const toml = require('toml');

class Manifest {
  constructor(values) {
    assert(values, 'No values were supplied for the manifest');
    assert(values.package, '[package] is a required field, with name, version, and authors specified');
    assert(values.package.name, '[package] name is a required field');
    assert(values.package.version, '[package] version is a required field');
    assert(values.package.authors, '[package] authors is a required field');

    this.metadata = {
      name: values.package.name,
      version: values.package.version,
      authors: values.package.authors,
    };

    this.src = [];
    eachObject(values.src, (details, name) => {
      if (isString(details)) {
        details = { path: details };
      }

      const src = Object.assign(details, {
        name,
      });
      this.src.push(src);
    });

    this.dependencies = [];
    eachObject(values.dependencies, (details, name) => {
      if (isString(details)) {
        details = { version: details };
      }
      
      const dependency = Object.assign(details, {
        name,
      });
      this.dependencies.push(dependency);
    });

    this.targets = (values.targets || []).map(target => {
      if (!target.name) {
        target.name = values.package.name;
      }

      return target;
    });
  }

  static load(dir) {
    return new Promise((resolve, reject) => {
      const file = path.join(dir, 'vba-block.toml');
      if (!fs.existsSync(file)) {
        return reject(new Error(`vba-blocks.toml not found in "${dir}"`));
      }

      fs.readFile(file, 'utf8', (err, data) => {
        if (err) return reject(err);

        let manifest;
        try {
          const parsed = toml.parse(data);
          manifest = new Manifest(parsed);
        } catch(err) {
          return reject(err);
        }

        resolve(manifest);
      });
    });
  }
}

module.exports = Manifest;

function eachObject(obj, fn) {
  if (!obj) {
    return;
  }

  Object.keys(obj).forEach(key => {
    fn(obj[key], key, obj);
  });
}

function isString(val) {
  return typeof val === 'string';
}
