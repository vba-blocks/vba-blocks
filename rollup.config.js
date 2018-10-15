import resolve from 'rollup-plugin-node-resolve';
import replace from 'rollup-plugin-replace';

const { version, dependencies } = require('./package.json');

const builtin = [
  'assert',
  'child_process',
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

const lib = {
  [`${src}/index.js`]: 'lib/index.js',
  [`${src}/resolve/sat-solver.js`]: 'lib/sat-solver.js'
};
const bin = {
  [`${src}/bin/vba-blocks-build.js`]: 'lib/bin/vba-blocks-build.js',
  [`${src}/bin/vba-blocks-export.js`]: 'lib/bin/vba-blocks-export.js',
  [`${src}/bin/vba-blocks-new.js`]: 'lib/bin/vba-blocks-new.js',
  [`${src}/bin/vba-blocks-init.js`]: 'lib/bin/vba-blocks-init.js',
  [`${src}/bin/vba-blocks-run.js`]: 'lib/bin/vba-blocks-run.js',
  [`${src}/bin/vba-blocks-healthcheck.js`]: 'lib/bin/vba-blocks-healthcheck.js',
  [`${src}/bin/vba-blocks-setup.js`]: 'lib/bin/vba-blocks-setup.js'
};

export default [
  {
    input: `${src}/bin/vba-blocks.js`,
    output: {
      format: 'cjs',
      file: 'lib/bin/vba-blocks.js',
      preferBuiltins: true
    },
    external,
    plugins: [
      resolve(),
      replace({
        VERSION: version,
        'DIR-ADDINS': '../../addins/build',
        'DIR-RUN-SCRIPTS': '../../run-scripts',
        'DIR-NATIVE': '../../native/target/debug',
        'DIR-BIN': '../../dist/unpacked/bin'
      })
    ],
    treeshake: { pureExternalModules: true }
  },

  ...Object.entries(lib).map(([input, file]) => {
    return {
      input,
      output: {
        format: 'cjs',
        file,
        preferBuiltins: true
      },
      external,
      plugins: [
        resolve(),
        replace({
          VERSION: version,
          'DIR-ADDINS': '../addins/build',
          'DIR-RUN-SCRIPTS': '../run-scripts',
          'DIR-NATIVE': '../native/target/debug',
          'DIR-BIN': '../dist/unpacked/bin'
        })
      ],
      treeshake: { pureExternalModules: true }
    };
  }),

  ...Object.entries(bin).map(([input, file]) => {
    return {
      input,
      output: {
        format: 'cjs',
        file,
        preferBuiltins: true
      },
      external,
      plugins: [
        resolve(),
        replace({
          VERSION: version,
          'sat-solver': '../sat-solver',
          'DIR-ADDINS': '../../addins/build',
          'DIR-RUN-SCRIPTS': '../../run-scripts',
          'DIR-NATIVE': '../../native/target/debug',
          'DIR-BIN': '../../dist/unpacked/bin'
        })
      ],
      treeshake: { pureExternalModules: true }
    };
  })
];
