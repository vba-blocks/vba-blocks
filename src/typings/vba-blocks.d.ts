declare module "vba-blocks" {
	interface RunResult {
		success: boolean;
		messages: string[];
		warnings: string[];
		errors: string[];
		stdout?: string;
		stderr?: string;
	}

	export function run(
		application: string,
		file: string,
		macro: string,
		args: string[]
	): Promise<RunResult>;
}
