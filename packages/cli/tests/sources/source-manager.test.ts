import { loadConfig } from '../../src/config';
import { isString, has } from '../../src/utils';
import Manager, { Source, Registration } from '../../src/sources';

const gitDependency = {
  name: 'a',
  defaultFeatures: true,
  features: [],
  git: 'https://github.com/VBA-tools/VBA-Web'
};
const gitRegistration: Registration = {
  id: 'a@1.0.0',
  name: 'a',
  version: '1.0.0',
  features: [],
  dependencies: [],
  source: 'git+<repo>#<rev>'
};

const registryDependency = {
  name: 'b',
  defaultFeatures: true,
  features: [],
  version: '1.0.0'
};
const registryRegistration: Registration = {
  id: 'b@1.0.0',
  name: 'b',
  version: '1.0.0',
  features: [],
  dependencies: [],
  source: 'registry+<link>'
};

const pathDependency = {
  name: 'c',
  defaultFeatures: true,
  features: [],
  path: './c'
};
const pathRegistration: Registration = {
  id: 'c@1.0.0',
  name: 'c',
  version: '1.0.0',
  features: [],
  dependencies: [],
  source: 'path+./c'
};

test('should update sources', async () => {
  const manager = await getManager();
  await manager.update();

  expect(getMock(getRegistry(manager).update).calls.length).toEqual(1);
});

test('should resolve using sources', async () => {
  const manager = await getManager();
  const registered = await manager.resolve(gitDependency);

  expect(getMock(getRegistry(manager).match).calls.length).toEqual(1);
  expect(getMock(getGit(manager).match).calls.length).toEqual(1);

  expect(getMock(getRegistry(manager).resolve).calls.length).toEqual(0);
  expect(getMock(getGit(manager).resolve).calls.length).toEqual(1);

  expect(registered).toMatchSnapshot();
});

test('should fetch using sources', async () => {
  const manager = await getManager();
  const path = await manager.fetch(registryRegistration);

  expect(path).toEqual('registry path');
});

test('should throw on unknown type', async () => {
  const manager = await getManager();
  await expect(manager.resolve(pathDependency)).rejects.toMatchSnapshot();
  await expect(manager.fetch(pathRegistration)).rejects.toMatchSnapshot();
});

async function getManager() {
  const config = await loadConfig();
  const instance = new Manager(config);
  instance.sources = [registry(), git()];

  return instance;
}

function registry(): Source {
  return {
    match: jest.fn(
      type => (isString(type) ? type === 'registry' : has(type, 'version'))
    ),
    update: jest.fn(),
    resolve: jest.fn((config, dependency) => [registryRegistration]),
    fetch: jest.fn((config, registration) => 'registry path')
  };
}

function git(): Source {
  return {
    match: jest.fn(
      type => (isString(type) ? type === 'git' : has(type, 'git'))
    ),
    resolve: jest.fn((config, dependency) => [gitRegistration]),
    fetch: jest.fn((config, registration) => 'git path')
  };
}

function getRegistry(manager: Manager) {
  return manager.sources[0];
}

function getGit(manager: Manager) {
  return manager.sources[1];
}

function getMock(value: any): any {
  return value.mock;
}
