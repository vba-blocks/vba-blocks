const { promisify } = require('util');
const {
  getProcesses,
  addToOPEN,
  removeFromOPEN,
  enableVBOM,
  addToPATH,
  removeFromPATH
} = require('./index.node');

module.exports = {
  getProcesses: promisify(getProcesses),
  addToOPEN,
  removeFromOPEN,
  enableVBOM,
  addToPATH,
  removeFromPATH
};
