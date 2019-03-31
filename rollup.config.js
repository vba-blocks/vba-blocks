import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import babel from 'rollup-plugin-babel';
import typescript from 'rollup-plugin-typescript';
import replace from 'rollup-plugin-replace';
import { terser } from 'rollup-plugin-terser';
import builtin from 'builtin-modules';

const mode = process.env.NODE_ENV || 'development';
const { version } = require('./package.json');

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
        include: 'node_modules/**',
        namedExports: {
          'ansi-colors': ['redBright', 'dim']
        }
      }),
      json(),
      babel({ extensions: ['.mjs', '.js', '.ts'] }),
      typescript(),
      replace({
        'process.env.NODE_ENV': JSON.stringify(mode),
        'process.env.READABLE_STREAM': '"disable"',
        _VERSION_: version
      }),
      mode === 'production' && terser(),
      readableStream()
    ].filter(Boolean),
    onwarn(warning, warn) {
      // Ignore known errors
      if (warning.code === 'CIRCULAR_DEPENDENCY' && /glob/.test(warning.importer)) return;
      if (warning.code === 'EVAL' && /minisat/.test(warning.id)) return;

      warn(warning);
    }
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
