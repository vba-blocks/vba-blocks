import dedent from 'dedent/macro';
import exportProject from '../actions/export-project';
const help = dedent `
  Export src from built target.

  Usage: vba-blocks export

  Options:
    --target=TYPE   Export target of type TYPE [default = target]`;
module.exports = async (args) => {
    if (args.help) {
        console.log(help);
        return;
    }
    const target = args.target;
    const completed = args.completed;
    const addin = args.addin;
    await exportProject({ target, completed, addin });
};
