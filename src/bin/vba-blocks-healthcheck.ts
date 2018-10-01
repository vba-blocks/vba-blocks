import env from '../env';
import { pathExists } from '../utils/fs';

module.exports = async () => {
  // Checklist:
  //
  // - run-scripts
  // - addins
  // - TODO git
  const errors = [];
  if (!(await pathExists(env.scripts))) {
    errors.push(`Missing run-scripts at "${env.scripts}"`);
  }
  if (!(await pathExists(env.addins))) {
    errors.push(`Missing addins at "${env.addins}"`);
  }
  if (!(await pathExists(env.native))) {
    errors.push(`Missing native binaries at "${env.native}"`);
  }

  if (errors.length) {
    throw new Error(
      `Healthcheck failed with the following errors:\n\n${errors
        .map(error => `- ${error}`)
        .join('\n')}`
    );
  }

  console.log('No issues found.');
};
