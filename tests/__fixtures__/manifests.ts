import { createManifest } from '@vba-blocks/helpers';

export const simple = createManifest({
  project: { name: 'simple-manifest' },
  dependencies: {
    a: '^1.0.0'
  }
});

export const complex = createManifest({
  project: { name: 'complex-manifest' },
  dependencies: {
    a: '^1',
    b: '^1.0'
  }
});

export const needsSat = createManifest({
  project: { name: 'needs-sat-manifest' },
  dependencies: {
    a: '^1',
    b: '^1',
    c: '0.1.0',
    d: '^1'
  }
});

export const unresolvable = createManifest({
  project: { name: 'unresolvable-manifest' },
  dependencies: {
    a: '^1',
    b: '^1.1.0',
    c: '0.1.0'
  }
});
