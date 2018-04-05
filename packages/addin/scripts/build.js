const { join } = require('path');
const mock = require('mock-require');
const { default: run } = require('vba-blocks/lib/utils/run');

mock('../../cli/lib/addin', {
  async importGraph(project, target, graph) {
    const file = join(project.paths.build, target.filename);
    const { src, references } = graph;

    const result = await run(
      'excel',
      join(__dirname, 'build/bootstrap.xlsm'),
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

main().catch(err => {
  console.error(err);
  process.exit(1);
});

async function main() {
  await vba.build();
}
