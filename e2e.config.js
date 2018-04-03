module.exports = {
  testEnvironment: 'node',
  testRegex: '\\.e2e\\.js$',
  snapshotSerializers: ['./packages/cli/e2e/helpers/execute-serializer']
};
