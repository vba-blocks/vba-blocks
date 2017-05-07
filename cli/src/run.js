const Config = require('./config');

const extensions = {
  excel: ['xlsx', 'xlsm', 'xlam'],
};
const addins = {
  excel: 'vba-blocks.xlam',
};

module.exports = function run(command, target, args) {
  let application;
  for (let key in extensions) {
    if (extensions[key].includes(target.type)) {
      application = key;
      break;
    }
  }

  if (!application) {
    return Promise.reject(new Error(`Unsupported target type: ${target.type}`));
  }

  return Config.load().then(config => {
    const addin = config.relativeToAddins(addins[application]);
    target = config.relativeToBuild(`${target.name}.${target.type}`);

    console.log(`run(${application}, ${addin}, ${command}, ${JSON.stringify(target)}, ${JSON.stringify(args)})`);
  });
};
