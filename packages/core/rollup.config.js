import ts from 'rollup-plugin-typescript';
import typescript from 'typescript';

export default {
  input: 'src/index.ts',
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
  plugins: [ts({ typescript })]
};
