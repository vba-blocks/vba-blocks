const is_test = process.env.BABEL_ENV === 'test' || process.env.NODE_ENV === 'test';

module.exports = {
  presets: [is_test && '@babel/preset-typescript'].filter(Boolean),
  plugins: [
    'babel-plugin-macros',
    '@babel/plugin-syntax-dynamic-import',
    is_test && 'babel-plugin-dynamic-import-node-babel-7',
    is_test ? '@babel/plugin-transform-typescript' : '@babel/plugin-syntax-typescript',
    is_test && '@babel/plugin-transform-modules-commonjs'
  ].filter(Boolean)
};
