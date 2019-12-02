import dedent from '@timhall/dedent/macro';
import mri, { Args } from 'mri';
import incrementVersion from '../actions/increment-version';

const help = dedent`
  Increment this project's version.

  Usage: vba-blocks version [<increment>] [options]

  Options:
    <increment>     VERSION | patch | minor | major | prepatch | preminor | premajor
    --preid=TYPE    Use TYPE for prerelease (e.g. "beta")
    -m, --message   git commit message (default: version)
    --[no-]git      Commit and add git tag for version (default: true)
    -s / --sign-git-tag   Sign git tag`;

export default async function(args: Args, argv: string[]) {
  if (args.help) {
    console.log(help);
    return;
  }

  args = mri(argv, { alias: { m: 'message', s: 'sign-git-tag' } });

  const increment = args._[0] || 'patch';
  const preid = args.preid as string | undefined;
  const message = args.message as string | undefined;
  const git = args.git as boolean;
  const sign = args['sign-git-tag'] as boolean;

  const version = await incrementVersion(increment, { preid, message, git, sign });
  console.log(version);
}
