import { addToPATH } from '../setup/path';
import { installAddin } from '../setup/addins';

export default async function setup() {
  await addToPATH();
  await installAddin('excel');
}
