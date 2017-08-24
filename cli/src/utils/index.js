const is = require('./is');
const eachObject = require('./each-object');
const plural = require('./plural');
const zip = require('./zip');

module.exports = Object.assign(
  {
    eachObject,
    plural,
    zip
  },
  is
);
