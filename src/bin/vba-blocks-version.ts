import dedent from "@timhall/dedent";
import { Args } from "mri";
import incrementVersion from "../actions/increment-version";

const help = dedent`
  Increment this project's version.

  Usage: vba-blocks version [<increment>] [options]

  Options:
    <increment>   VERSION | patch | minor | major | prepatch | preminor | premajor
    --preid=TYPE   Use TYPE for prerelease (e.g. "beta")`;

export default async function(args: Args) {
	if (args.help) {
		console.log(help);
		return;
	}

	const increment = args._[0] || "patch";
	const preid = args.preid as string | undefined;

	const version = await incrementVersion(increment, { preid });
	console.log(version);
}
