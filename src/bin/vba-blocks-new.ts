import { Args } from 'mri';
import dedent from 'dedent';
import create from '../actions/create';

const help = `
  Create new project or package with the given name in a new directory

  Usage: vba-blocks new <name> [options]

  Options:
    --target=TYPE   Add target of type TYPE to project
    --package       Create as package
    --no-git        Skip initializing git reposistory`;

module.exports = async (args: Args) => {
  if (args.help) {
    console.log(help);
    return;
  }

  await create(args);
};
