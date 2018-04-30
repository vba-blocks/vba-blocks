import env from '@vba-blocks/src/env';
import { addins } from '@vba-blocks/src/addin';
import { unixJoin } from '@vba-blocks/src/utils';
import { open, close } from '@vba-blocks/src/utils/run';

const excel = 'excel';

export const openExcel = async () => {
  const addin = unixJoin(env.addins, addins[excel]);
  await open(excel, addin);
};
export const closeExcel = async () => {
  const addin = unixJoin(env.addins, addins[excel]);
  await close(excel, addin);
};
