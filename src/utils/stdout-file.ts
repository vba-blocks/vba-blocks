import { env } from "../env";
import { readFileSync, tmpFile, watch } from "./fs";
import { Observable } from "./observable";
import { basename } from "./path";

const debug = env.debug("vba-blocks:stdout-file");

export async function createStdoutFile(): Promise<string> {
	const file = await tmpFile({ dir: env.staging });
	debug("file:", file);

	watchFile(file).subscribe(contents => console.log(contents));
	return file;
}

export function watchFile(file: string): Observable<string> {
	return new Observable(observer => {
		const watching = basename(file);
		let cursor = 0;

		watch(file, { persistent: false }, (event: string, filename: string) => {
			if (filename === watching && event === "change") {
				const buffer = readFileSync(file);
				const next = buffer.toString("utf8", cursor).trim();

				cursor = buffer.length;
				observer.next(next);
			}
		});
	});
}
