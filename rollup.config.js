import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import babel from 'rollup-plugin-babel';
import typescript from 'rollup-plugin-typescript';
import replace from 'rollup-plugin-replace';
import { terser } from 'rollup-plugin-terser';
import filesize from 'rollup-plugin-filesize';
import builtin from 'builtin-modules';

const mode = 'development'; // TODO process.env.NODE_ENV / 'production'

export default [
  {
    input: ['src/index.ts', 'src/bin/vba-blocks.ts'],
    output: {
      format: 'cjs',
      dir: 'lib'
    },
    external: [...builtin],
    plugins: [
      resolve(),
      commonjs({
        include: 'node_modules/**'
      }),
      json(),
      babel({ extensions: ['.mjs', '.js', '.ts'] }),
      typescript(),
      replace({
        'process.env.NODE_ENV': JSON.stringify(mode),
        'process.env.READABLE_STREAM': '"disable"'
      }),
      mode === 'production' && terser(),
      readableStream()
      // filesize() TODO throwing .length error
    ].filter(Boolean)
  }
];

// Explicitly export modern API from readable-stream
// (exclude fallback API)
function readableStream() {
  const isReadable = /readable\-stream[\\,\/]readable\.js/;
  const isPassthrough = /readable\-stream[\\,\/]passthrough\.js/;
  const isDuplex = /readable\-stream[\\,\/]duplex\.js/;

  return {
    name: 'readable-stream',
    load(id) {
      if (isReadable.test(id)) {
        return {
          code: `
            const Stream = require('stream');

            exports = module.exports = Stream.Readable;
            exports.Readable = Stream.Readable;
            exports.Writable = Stream.Writable;
            exports.Duplex = Stream.Duplex;
            exports.Transform = Stream.Transform;
            exports.PassThrough = Stream.PassThrough;
            exports.Stream = Stream;
          `
        };
      }
      if (isPassthrough.test(id)) {
        return {
          code: `module.exports = require('stream').PassThrough;`
        };
      }
      if (isDuplex.test(id)) {
        return {
          code: `module.exports = require('stream').Duplex;`
        };
      }

      return null;
    }
  };
}

// const { version, dependencies } = require('./package.json');

// const external = [...Object.keys(dependencies), ...builtin];
// const src = 'typings';

// const lib = {
//   [`${src}/index.js`]: 'lib/index.js',
//   [`${src}/resolve/sat-solver.js`]: 'lib/sat-solver.js'
// };
// const bin = {
//   [`${src}/bin/vba-blocks-build.js`]: 'lib/bin/vba-blocks-build.js',
//   [`${src}/bin/vba-blocks-export.js`]: 'lib/bin/vba-blocks-export.js',
//   [`${src}/bin/vba-blocks-new.js`]: 'lib/bin/vba-blocks-new.js',
//   [`${src}/bin/vba-blocks-init.js`]: 'lib/bin/vba-blocks-init.js',
//   [`${src}/bin/vba-blocks-run.js`]: 'lib/bin/vba-blocks-run.js'
// };

// export default [
//   {
//     input: `${src}/bin/vba-blocks.js`,
//     output: {
//       format: 'cjs',
//       file: 'lib/bin/vba-blocks.js',
//       preferBuiltins: true
//     },
//     external,
//     plugins: [
//       resolve(),
//       replace({
//         VERSION: version,
//         'DIR-ADDINS': '../../addins/build',
//         'DIR-RUN-SCRIPTS': '../../run-scripts',
//         'DIR-BIN': '../../dist/unpacked/bin'
//       }),
//       babel()
//     ],
//     treeshake: { pureExternalModules: true }
//   },

//   ...Object.entries(lib).map(([input, file]) => {
//     return {
//       input,
//       output: {
//         format: 'cjs',
//         file,
//         preferBuiltins: true
//       },
//       external,
//       plugins: [
//         resolve(),
//         replace({
//           VERSION: version,
//           'DIR-ADDINS': '../addins/build',
//           'DIR-RUN-SCRIPTS': '../run-scripts',
//           'DIR-BIN': '../dist/unpacked/bin'
//         }),
//         babel()
//       ],
//       treeshake: { pureExternalModules: true }
//     };
//   }),

//   ...Object.entries(bin).map(([input, file]) => {
//     return {
//       input,
//       output: {
//         format: 'cjs',
//         file,
//         preferBuiltins: true
//       },
//       external,
//       plugins: [
//         resolve(),
//         replace({
//           VERSION: version,
//           'sat-solver': '../sat-solver',
//           'DIR-ADDINS': '../../addins/build',
//           'DIR-RUN-SCRIPTS': '../../run-scripts',
//           'DIR-BIN': '../../dist/unpacked/bin'
//         }),
//         babel()
//       ],
//       treeshake: { pureExternalModules: true }
//     };
//   })
// ];
