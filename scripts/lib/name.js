function parseName(name) {
  name = name.toLowerCase();

  let scope;
  let pkg;
  if (name.includes('/')) {
    [scope, pkg] = name.split('/');
  } else {
    pkg = name;
  }

  return { scope, name: pkg, parts: scope ? [scope, pkg] : [pkg] };
}

module.exports = {
  parseName
};
