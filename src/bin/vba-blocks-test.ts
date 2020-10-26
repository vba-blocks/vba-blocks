import dedent from "@timhall/dedent";
import { Args } from "mri";
import { testProject } from "../actions/test-project";

const help = dedent`
  Run tests for built target.

  Usage: vba-blocks test [options]

  Options:
    --target=TYPE   Run in pre-built target of type TYPE

  Notes:
  Currently, vba-blocks uses the following convention:

  Windows: "vba run Tests.Run CON"
  Mac:     "vba run Tests.Run /dev/stdout"

  For more information, see https://vba-blocks.com/guides/testing`;

export default async function(args: Args) {
	if (args.help) {
		console.log(help);
		return;
	}

	const test_args = args._;
	const target = args.target as string | undefined;

	await testProject({ target, args: test_args });
}
