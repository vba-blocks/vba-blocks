import { Args } from 'mri';
import dedent from 'dedent';
import importProject from '../actions/import-project';

const help = dedent`
  Import src to built targets.

  Rebuild VBA project (src and dependencies) of existing built target.
  To completely rebuild project (including changes in target), use "vba-blocks build".

  Usage: vba-blocks import [options]

  Options:
    --target=TYPE   Import only the given target`;

module.exports = async (args: Args) => {
  if (args.help) {
    console.log(help);
    return;
  }

  await importProject(args);
};
