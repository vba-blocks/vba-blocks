import { parse, convert } from '../src';
import { fixture } from './patch.test';

test('convert', () => {
  expect(convert(parse(fixture))).toMatchSnapshot();
});
