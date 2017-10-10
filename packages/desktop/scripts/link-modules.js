// Add symlink of workspace node_modules to desktop node_modules
// (https://github.com/electron-userland/electron-builder/issues/1837)

const { promisify } = require('util');
const { symlink: _symlink, existsSync } = require('fs');
const { join } = require('path');
const resolvePkg = require('resolve-pkg');
const symlink = promisify(_symlink);

const cwd = process.cwd();
const node_modules = join(__dirname, '..', 'node_modules');

async function main() {
  const graph = await loadGraph(cwd);
  const dependencies = filterGraph(graph, cwd);

  await Promise.all(
    dependencies.map(async dependency => {
      const { name, path } = dependency;
      const dest = join(node_modules, name);

      if (existsSync(dest)) return;
      console.log(`Linking ${name}`);
      await symlink(path, dest, 'junction');
    })
  );
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
    if (depth !== 1) return false;

    return true;
  });
}
