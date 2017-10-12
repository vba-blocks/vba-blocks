// Add symlink of workspace node_modules to desktop node_modules
// (https://github.com/electron-userland/electron-builder/issues/1837)

const { pathExists, copy, symlink, remove } = require('fs-extra');
const { join } = require('path');
const resolvePkg = require('resolve-pkg');

const cwd = process.cwd();
const node_modules = join(__dirname, '..', 'node_modules');

const internal_dependencies = ['vba-blocks'];

async function main() {
  // Remove internal dependencies to ensure they are always copied
  await parallel(internal_dependencies, async name => {
    const dest = join(node_modules, name);

    if (!await pathExists(dest)) return;
    await remove(dest);
  });

  const graph = await loadGraph(cwd);
  const dependencies = filterGraph(graph, cwd);

  await parallel(dependencies, async dependency => {
    const { name, path } = dependency;

    const dest = join(node_modules, name);

    // Always copy vba-blocks
    if (await pathExists(dest)) return;

    console.log(`Copying ${name}`);
    await copy(path, dest);
  });
}

main().catch(err => {
  console.error(err.stack || err);
  process.exit(1);
});

async function loadGraph(cwd, graph = new Map()) {
  const pkg = require(join(cwd, 'package.json'));
  const dependencies = (pkg && pkg.dependencies) || {};

  for (const name of Object.keys(dependencies)) {
    if (graph.has(name)) continue;

    const path = resolvePkg(name, { cwd });
    graph.set(name, { name, path });

    await loadGraph(path, graph);
  }

  return Array.from(graph.values());
}

function filterGraph(graph, cwd) {
  return graph.filter(dependency => {
    const { path } = dependency;
    if (path.indexOf(node_modules) === 0) return false;

    const depth = (path.match(/node_modules/g) || []).length;
    if (depth > 1) return false;

    return true;
  });
}

async function parallel(values, cb) {
  return Promise.all(values.map(cb));
}
