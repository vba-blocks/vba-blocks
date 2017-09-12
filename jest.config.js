module.exports = {
  moduleFileExtensions: ['ts', 'js', 'json'],
  projects: ['packages/*'],
  testRegex: '\\.(test|spec)\\.(ts|js)$',
  transform: {
    '^.+\\.tsx?$': '<rootDir>/node_modules/ts-jest/preprocessor.js'
  }
};
