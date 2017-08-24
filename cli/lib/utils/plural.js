module.exports = function plural(value, single, multiple) {
  return value === 1 ? single : multiple;
};
