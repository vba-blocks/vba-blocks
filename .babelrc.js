const is_test = process.env.BABEL_ENV === 'test' || process.env.NODE_ENV === 'test';

module.exports = {
  presets: ['@babel/preset-typescript'],
  plugins: ['babel-plugin-macros', is_test && '@babel/plugin-transform-modules-commonjs'].filter(
    Boolean
  )
};
