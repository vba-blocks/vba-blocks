import { join } from 'path';
import { outputFile } from 'fs-extra';
import env from '../env';

module.exports = async () => {
  // 1. Add "/Applications/vba-blocks.app/bin/" to .profile/.bash_profile
  // 2. Create symlink to add-ins in some accessible folder

  const log = join(env.cache, 'log.txt');
  await outputFile(log, 'TODO');
};
