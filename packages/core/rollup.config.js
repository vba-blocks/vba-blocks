import commonjs from 'rollup-plugin-commonjs';
import ts from 'rollup-plugin-typescript2';
import typescript from 'typescript';

export default {
  input: 'src/index.ts',
  external: [
    // Native
    'crypto',
    'https',
    'os',
    'path',
    'readline',

    // Dependencies
    'archiver',
    'commander',
    'dugite',
    'fs-extra',
    'logic-solver',
    'semver',
    'tar',
    'tmp',
    'toml'
  ],
  output: [
    {
      format: 'es',
      file: 'lib/index.es.js',
      sourcemap: true
    },
    {
      format: 'cjs',
      file: 'lib/index.js',
      sourcemap: true
    }
  ],
  plugins: [
    commonjs(),
    ts({
      cacheRoot: '.typescript-cache',
      typescript
    })
  ]
};
