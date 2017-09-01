import { join } from 'path';
import { Config, loadConfig } from './config';

const extensions = {
  excel: ['xlsx', 'xlsm', 'xlam']
};
const addins = {
  excel: 'vba-blocks.xlam'
};

export default async function run(command, target, args) {
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

  const config = await loadConfig();
  const addin = join(config.addins, addins[application]);
  target = join(config.build, `${target.name}.${target.type}`);

  console.log(
    `run(${application}, ${addin}, ${command}, ${JSON.stringify(
      target
    )}, ${JSON.stringify(args)})`
  );
}
