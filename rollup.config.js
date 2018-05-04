import { join } from 'path';
import { readFileSync } from 'fs';
import resolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';

const { version, dependencies } = require('./package.json');

const plugins = [
  resolve(),
  replace({
    'process.env.NODE_ENV': JSON.stringify(
      process.env.NODE_ENV || 'development'
    ),
    VERSION: version
  })
];

const builtin = [
  'assert',
  'crypto',
  'fs',
  'https',
  'os',
  'path',
  'querystring',
  'util'
];
const external = [...Object.keys(dependencies), ...builtin];
const src = 'typings';

const mapping = {
  [`${src}/index.js`]: 'lib/index.js',
  [`${src}/bin/vba-blocks-add.js`]: 'lib/bin/vba-blocks-add.js',
  [`${src}/bin/vba-blocks-build.js`]: 'lib/bin/vba-blocks-build.js',
  [`${src}/bin/vba-blocks-export.js`]: 'lib/bin/vba-blocks-export.js',
  [`${src}/bin/vba-blocks-init.js`]: 'lib/bin/vba-blocks-init.js',
  [`${src}/bin/vba-blocks-new.js`]: 'lib/bin/vba-blocks-new.js',
  [`${src}/bin/vba-blocks-target.js`]: 'lib/bin/vba-blocks-target.js'
};

const intro = `require('v8-compile-cache');
Error.stackTraceLimit = Infinity;`;

export default [
  {
    input: `${src}/bin/vba-blocks.js`,
    output: {
      format: 'cjs',
      file: 'lib/bin/vba-blocks.js',
      preferBuiltins: true,
      intro
    },
    external,
    plugins,
    treeshake: { pureExternalModules: true }
  },

  ...Object.entries(mapping).map(([input, file]) => {
    return {
      input,
      output: {
        format: 'cjs',
        file,
        preferBuiltins: true
      },
      external,
      plugins,
      treeshake: { pureExternalModules: true }
    };
  })
];
