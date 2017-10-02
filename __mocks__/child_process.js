const noop = () => {};

module.exports = {
  exec: jest.fn((command, cb = noop) => cb(null, '', ''))
};
