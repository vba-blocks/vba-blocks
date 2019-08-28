import { fetch, resolve, Sources } from '../';
import { GitDependency, PathDependency, RegistryDependency } from '../../manifest/dependency';
import { Registration } from '../registration';

const gitDependency: GitDependency = {
  name: 'a',
  git: 'https://github.com/VBA-tools/VBA-Web'
};
const gitRegistration: Registration = {
  id: 'a@1.0.0',
  name: 'a',
  version: '1.0.0',
  dependencies: [],
  source: 'git+<repo>#<rev>'
};

const registryDependency: RegistryDependency = {
  name: 'b',
  version: '1.0.0',
  registry: 'vba-blocks'
};
const registryRegistration: Registration = {
  id: 'b@1.0.0',
  name: 'b',
  version: '1.0.0',
  dependencies: [],
  source: 'registry+vba-blocks#<hash>'
};

const pathDependency: PathDependency = {
  name: 'c',
  path: './c'
};
const pathRegistration: Registration = {
  id: 'c@1.0.0',
  name: 'c',
  version: '1.0.0',
  dependencies: [],
  source: 'path+c'
};

const unknownDependency: RegistryDependency = {
  name: 'unknown',
  version: '1.0.0',
  registry: 'unknown-registry'
};
const unknownRegistration: Registration = {
  id: 'unknown@1.0.0',
  name: 'unknown',
  version: '1.0.0',
  dependencies: [],
  source: 'registry+unknown-registry#<hash>'
};

test('should resolve from registry using sources', async () => {
  const sources = getSources();
  const registered = await resolve(sources, registryDependency);

  expect(getMock(sources.registry['vba-blocks'].resolve).calls.length).toEqual(1);
  expect(getMock(sources.path.resolve).calls.length).toEqual(0);
  expect(getMock(sources.git.resolve).calls.length).toEqual(0);

  expect(registered).toMatchSnapshot();
});

test('should resolve from path using sources', async () => {
  const sources = getSources();
  const registered = await resolve(sources, pathDependency);

  expect(getMock(sources.registry['vba-blocks'].resolve).calls.length).toEqual(0);
  expect(getMock(sources.path.resolve).calls.length).toEqual(1);
  expect(getMock(sources.git.resolve).calls.length).toEqual(0);

  expect(registered).toMatchSnapshot();
});

test('should resolve from git using sources', async () => {
  const sources = getSources();
  const registered = await resolve(sources, gitDependency);

  expect(getMock(sources.registry['vba-blocks'].resolve).calls.length).toEqual(0);
  expect(getMock(sources.path.resolve).calls.length).toEqual(0);
  expect(getMock(sources.git.resolve).calls.length).toEqual(1);

  expect(registered).toMatchSnapshot();
});

test('should fetch from registry using sources', async () => {
  const sources = getSources();
  const path = await fetch(sources, registryRegistration);

  expect(getMock(sources.registry['vba-blocks'].fetch).calls.length).toEqual(1);
  expect(getMock(sources.path.fetch).calls.length).toEqual(0);
  expect(getMock(sources.git.fetch).calls.length).toEqual(0);

  expect(path).toEqual('registry path');
});

test('should fetch from path using sources', async () => {
  const sources = getSources();
  const path = await fetch(sources, pathRegistration);

  expect(getMock(sources.registry['vba-blocks'].fetch).calls.length).toEqual(0);
  expect(getMock(sources.path.fetch).calls.length).toEqual(1);
  expect(getMock(sources.git.fetch).calls.length).toEqual(0);

  expect(path).toEqual('path');
});

test('should fetch from git using sources', async () => {
  const sources = getSources();
  const path = await fetch(sources, gitRegistration);

  expect(getMock(sources.registry['vba-blocks'].fetch).calls.length).toEqual(0);
  expect(getMock(sources.path.fetch).calls.length).toEqual(0);
  expect(getMock(sources.git.fetch).calls.length).toEqual(1);

  expect(path).toEqual('git path');
});

test('should throw on unknown type', async () => {
  const sources = getSources();
  await expect(resolve(sources, unknownDependency)).rejects.toMatchSnapshot();
  await expect(fetch(sources, unknownRegistration)).rejects.toMatchSnapshot();
});

function getSources() {
  const sources: Sources = {
    registry: {
      'vba-blocks': {
        resolve: jest.fn(_dependency => [registryRegistration]),
        fetch: jest.fn(_registration => 'registry path')
      }
    },
    path: {
      resolve: jest.fn(_dependency => [pathRegistration]),
      fetch: jest.fn(_registration => 'path')
    },
    git: {
      resolve: jest.fn(_dependency => [gitRegistration]),
      fetch: jest.fn(_registration => 'git path')
    }
  };

  return sources;
}

function getMock(value: any): any {
  return value.mock;
}
