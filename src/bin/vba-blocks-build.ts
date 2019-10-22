import dedent from '@timhall/dedent/macro';
import { Args } from 'mri';
import open from 'open';
import time from 'pretty-hrtime';
import build from '../actions/build-project';

const help = dedent`
  Build project from manifest.

  Create a clean build of the project (after backing up any existing built targets).

  Usage: vba-blocks build [options]

  Options:
    --target=TYPE   Build target of type TYPE
    --release       Exclude dev-* items from build
    --open          Open built target`;

export default async function(args: Args) {
  if (args.help) {
    console.log(help);
    return;
  }

  const start = process.hrtime();
  const target = <string | undefined>args.target;
  const addin = <string | undefined>args.addin;
  const release = !!args.release;

  const path = await build({ target, addin, release });
  console.log(`Done. ${time(process.hrtime(start))}`);

  if (!!args.open) {
    await open(path);
  }
}
