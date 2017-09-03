import ts from 'rollup-plugin-typescript2';
import typescript from 'typescript';

export default {
  input: 'src/index.ts',
  external: [
    // Native
    'crypto',
    'https',
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
    ts({
      cacheRoot: '.typescript-cache',
      typescript
    })
  ]
};
