import { Args } from 'mri';
import dedent from 'dedent/macro';
import run from '../actions/run';

const help = dedent`
  Run macro in given workbook or add-in.

  Usage vba-blocks run <macro> [<arg>...] [options]

  Options:
    <macro>         Public macro to run in given file (e.g. Tests.RunTests)
    <arg>           Arguments to pass to macro (optional)
    --target=TYPE   Run in pre-built target of type TYPE
    --file=PATH     Full path to workbook or name of add-in`;

export default async function(args: Args) {
  if (args.help) {
    console.log(help);
    return;
  }

  const [macro, ...macro_args] = args._;
  const target = args.target as string | undefined;
  let file = args.file as string | undefined;

  await run({ target, file, macro, args: macro_args });
}
