const download = require('./download');
const eachObject = require('./each-object');
const plural = require('./plural');
const zip = require('./zip');

const git = require('./git');
const is = require('./is');

module.exports = Object.assign(
  {
    download,
    eachObject,
    plural,
    zip
  },
  git,
  is
);
