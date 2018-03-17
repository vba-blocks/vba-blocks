const { join } = require('path');
const mock = require('mock-require');
const { default: run } = require('vba-blocks/lib/utils/run');

mock('../../cli/lib/addin', {
  async importGraph(project, target, graph) {
    const file = join(project.paths.build, `${target.name}.${target.type}`);
    const { src, references } = graph;

    const result = await run(
      project.config,
      'excel',
      join(__dirname, 'bootstrap.xlsm'),
      'Build.ImportGraph',
      {
        file,
        src,
        references
      }
    );
  }
});

const vba = require('vba-blocks');

main().catch(err => console.error(err));

async function main() {
  await vba.build();
}
