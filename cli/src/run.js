const Config = require('./config');

const extensions = {
  excel: ['xlsx', 'xlsm', 'xlam']
};
const addins = {
  excel: 'vba-blocks.xlam'
};

module.exports = async function run(command, target, args) {
  let application;
  for (let key in extensions) {
    if (extensions[key].includes(target.type)) {
      application = key;
      break;
    }
  }

  if (!application) {
    throw new Error(`Unsupported target type: ${target.type}`);
  }

  const config = await Config.load();
  const addin = config.relativeToAddins(addins[application]);
  target = config.relativeToBuild(`${target.name}.${target.type}`);

  console.log(
    `run(${application}, ${addin}, ${command}, ${JSON.stringify(
      target
    )}, ${JSON.stringify(args)})`
  );
};
