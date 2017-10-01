import {
  getRegistrationId,
  getRegistrationSource,
  fromSnapshot
} from '../../src/sources/registration';

const snapshot = {
  name: 'a',
  version: '1.0.0',
  features: [],
  dependencies: []
};

test('should get registration id from snapshot', () => {
  const id = getRegistrationId(snapshot);
  expect(id).toEqual('a@1.0.0');
});

test('should get registration id from name + version', () => {
  const id = getRegistrationId('a', '1.0.0');
  expect(id).toEqual('a@1.0.0');
});

test('should get registration source', () => {
  let source = getRegistrationSource('type', 'value');
  expect(source).toEqual('type+value');

  source = getRegistrationSource('type', 'value', 'details');
  expect(source).toEqual('type+value#details');
});

test('should get registration from snapshot', () => {
  const registration = fromSnapshot(snapshot, 'type+value#details');
  expect(registration).toMatchSnapshot();
});
