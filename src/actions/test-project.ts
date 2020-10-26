import { env } from "../env";
import { runMacro } from "./run-macro";

export interface TestOptions {
	target?: string;
	args: string[];
}

export async function testProject(options: TestOptions) {
	const { target, args } = options;
	const macro = "Tests.Run";
	const stdout = env.isWindows ? "CON" : "/dev/stdout";

	await runMacro({ target, macro, args: [stdout, ...args] });
}
