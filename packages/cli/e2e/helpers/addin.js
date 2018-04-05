const { default: env } = require('../../lib/env');
const { addins } = require('../../lib/addin');
const { unixJoin } = require('../../lib/utils');
const { open, close } = require('../../lib/utils/run');

const excel = 'excel';

module.exports = {
  openExcel: async () => {
    const addin = unixJoin(env.addins, addins[excel]);
    await open(excel, addin);
  },
  closeExcel: async () => {
    const addin = unixJoin(env.addins, addins[excel]);
    await close(excel, addin);
  }
};
