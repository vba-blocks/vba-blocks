import { Args } from 'mri';
import dedent from 'dedent/macro';
import run from '../actions/run';

const help = dedent`
  Run macro in given workbook or add-in.

  Usage vba-blocks run <file> <macro> <arg>

  Options:
    <file>    Full path to workbook or name of add-in
    <macro>   Public macro to run in given file (e.g. Tests.RunTests)
    <arg>     Argument to pass to macro (optional)`;

export default async function(args: Args) {
  if (args.help) {
    console.log(help);
    return;
  }

  const [file, macro, arg] = args._;
  await run({ file, macro, arg });
}
