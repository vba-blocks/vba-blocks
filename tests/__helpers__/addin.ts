import env from '../../src/env';
import { addins } from '../../src/addin';
import { unixJoin } from '../../src/utils';
import { open, close } from '../../src/utils/run';

const excel = 'excel';

export const openExcel = async () => {
  const addin = unixJoin(env.addins, addins[excel]);
  await open(excel, addin);
};
export const closeExcel = async () => {
  const addin = unixJoin(env.addins, addins[excel]);
  await close(excel, addin);
};
