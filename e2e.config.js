module.exports = {
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js', 'json'],
  testRegex: '\\.e2e\\.ts$',
  snapshotSerializers: ['<rootDir>/tests/__helpers__/execute-serializer'],
  transform: {
    '^.+\\.ts$': 'ts-jest/preprocessor.js'
  },
  moduleNameMapper: {
    '@vba-blocks/helpers(.*)': '<rootDir>/tests/__helpers__$1',
    '@vba-blocks/fixtures(.*)': '<rootDir>/tests/__fixtures__$1'
  }
};
