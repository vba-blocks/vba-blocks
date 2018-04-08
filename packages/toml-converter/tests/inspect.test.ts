import inspect from '../src/inspect';
import { fixture } from './patch.test';

test('inspect', () => {
  expect(inspect(fixture)).toMatchSnapshot();
});
