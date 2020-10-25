import dedent from "@timhall/dedent";
import { Args } from "mri";
import create from "../actions/create-project";

const help = dedent`
  Create a new project / package in a new directory

  Usage: vba-blocks new <name> [options]

  Options:
    <name>          Project/package name (optionally, with extension)
    --target=TYPE   Add target of type TYPE to project (e.g. xlsm)
    --from=PATH     Create target and src from workbook/document
    --package       Create as package
    --no-git        Skip initializing git repository

  Examples:
  vba-blocks new analysis.xlsm
  vba-blocks new analysis --target xlsm
  vba-blocks new calculations --package
  `;

export default async function(args: Args) {
	if (args.help) {
		console.log(help);
		return;
	}

	const [name] = args._;
	const target = <string | undefined>args.target;
	const from = <string | undefined>args.from;
	const pkg = !!args.package;
	const git = "git" in args ? <boolean>args.git : true;

	await create({ name, target, from, pkg, git });
}
