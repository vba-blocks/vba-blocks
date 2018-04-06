import dedent from 'dedent';
import { parse, patch } from '../src';

export const fixture = dedent`
  [package]
  name = "package-name" # comment
  version = "0.0.0"
  authors = ["Author 1"]

  # 1
  # 2
  # 3

  # 5

  [dependencies]
  a = "1.0.0"
  b = { git = "...git"  , spacing =    "weird"}#comment

  [dependencies.c]
  path = "...path"

  [[array]]
  index = 0

  [[array]]
  index = 1`;

test('patch', () => {
  const value = parse(fixture);
  value.package.authors.push('Author 2');
  value.package.custom = true;
  value.dependencies.b.optional = true;
  value.dependencies.d = '0.0.0';
  value.dependencies.e = { version: '1.0.0', optional: true };
  value.array.unshift({ index: -1 });

  console.log(JSON.stringify(value, null, 2));
  const result = patch(fixture, value);
  // console.log(result);
});
