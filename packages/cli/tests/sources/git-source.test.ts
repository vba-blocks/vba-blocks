import git from '../../src/sources/git-source';

test('should match "git" type', () => {
  expect(git.match('registry')).toEqual(false);
  expect(git.match('path')).toEqual(false);
  expect(git.match('git')).toEqual(true);
});

test('should match git dependency', () => {
  expect(
    git.match({
      name: 'git',
      git: 'https://github.com/VBA-tools/VBA-Web',
      defaultFeatures: true,
      features: []
    })
  ).toEqual(true);

  expect(
    git.match({
      name: 'non-git',
      version: '1.0.0',
      defaultFeatures: true,
      features: []
    })
  ).toEqual(false);
});

test('should resolve git dependency', () => {
  // TODO
});

test('should fetch git dependency', () => {
  // TODO
});
