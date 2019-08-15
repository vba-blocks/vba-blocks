import dedent from 'dedent/macro';
import { CliError, ErrorCode } from '../../errors';
import { Source } from '../../sources/source';
import { Registration } from '../../sources/registration';
import { Dependency } from '../../manifest/dependency';

const message = dedent`
  git dependencies are not support.

  Upgrade to Professional Edition (coming soon) for git dependencies and more.
`;

export default class GitSource implements Source {
  resolve(_dependency: Dependency): Registration[] {
    throw new CliError(ErrorCode.SourceUnsupported, message);
  }
  fetch(_registration: Registration): string {
    throw new CliError(ErrorCode.SourceUnsupported, message);
  }
}
