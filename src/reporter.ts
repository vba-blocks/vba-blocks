import dedent from 'dedent/macro';

import { Reporter, Progress } from './types';

export const reporter: Reporter = {
  log(message) {
    if (!this.silent) console.log(message);
  },

  progress(name): Progress {
    return {
      start: () => {
        if (!this.silent) console.log(name);
      },
      tick() {},
      done() {}
    };
  },

  messages: {
    'build-project-loading': () => dedent`
      [1/3] Loading project...`,

    'build-target-building': ({ target, project, dependencies }) => dedent`
      \n[2/3] Building target "${target.type}" for "${project.manifest.name}"...
      ${dependencies.length ? `\nDependencies:\n${dependencies.join('\n')}` : ''}`,

    'build-lockfile-writing': ({ skipped }) => dedent`
      \n[3/3] Writing lockfile...${skipped ? ' (skipped, no changes)' : ''}`,

    'export-project-loading': () => dedent`
      [1/3] Loading project...`,

    'export-to-staging': ({ target }) => dedent`
      \n[2/3] Exporting src from "${target.filename}"`,

    'export-to-project': () => dedent`
      \n[3/3] Updating project`,

    'project-updating': () => dedent`
      Updating src files`,

    'dependencies-resolving': () => dedent`
      Resolving dependencies`,

    'dependencies-fetching': () => dedent`
      Fetching dependencies`,

    'export-loading': () => dedent`
      Loading exported components`,

    'patch-apply-changes': () => dedent`
      \nThe following changes need to be applied to vba-block.toml:`,

    'patch-add-src': () => dedent`
      Add the following to the [src] section:`,

    'patch-remove-src': ({ name }) => dedent`
      Remove "${name}" from the [src] section`,

    'patch-add-dependency': () => dedent`
      Add the following to the [dependencies] section:`,

    'patch-remove-dependency': ({ name }) => dedent`
      Remove "${name}" from the [dependencies] section`,

    'patch-add-reference': () => dedent`
      Add the following to the [references] section:`,

    'patch-remove-reference': ({ name }) => dedent`
      Remove "${name}" from the [references] section`
  }
};
