import dedent from "@timhall/dedent";
import { CliError, ErrorCode } from "../../errors";
import { Dependency } from "../../manifest/dependency";
import { Registration } from "../../sources/registration";
import { Source } from "../../sources/source";

const message = dedent`
  git dependencies are not currently supported.

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
