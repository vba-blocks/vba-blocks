import dedent from "@timhall/dedent";
import { Args } from "mri";
import { exportProject } from "../actions/export-project";

const help = dedent`
  Export built project, including src, references, and target.

  Usage: vba-blocks export

  Options:
    --target=TYPE   Export target of type TYPE`;

export default async function(args: Args) {
	if (args.help) {
		console.log(help);
		return;
	}

	const target = <string | undefined>args.target;
	const completed = <string | undefined>args.completed;
	const addin = <string | undefined>args.addin;

	await exportProject({ target, completed, addin });
}
