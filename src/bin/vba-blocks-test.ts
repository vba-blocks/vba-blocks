import dedent from 'dedent/macro';
import { Args } from 'mri';
import test from '../actions/test-project';

const help = dedent`
  Run tests for built target.

  Note: Currently, vba-blocks uses the following convention:

  Windows: "vba run Tests.Run CON"
  Mac:     "vba run Tests.Run /dev/stdout"

  For more information, see https://vba-blocks.com/guides/testing

  Usage vba-blocks test [options]

  Options:
    --target=TYPE   Run in pre-built target of type TYPE`;

export default async function(args: Args) {
  if (args.help) {
    console.log(help);
    return;
  }

  const test_args = args._;
  const target = args.target as string | undefined;

  await test({ target, args: test_args });
}
