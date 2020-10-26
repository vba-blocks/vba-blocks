import { createWriteStream } from "fs";
import fetch from "node-fetch";
import { ensureDir } from "./fs";
import { dirname } from "./path";

export async function download(url: string, dest: string): Promise<void> {
	await ensureDir(dirname(dest));

	return fetch(url).then(response => {
		const file = createWriteStream(dest);

		return new Promise<void>((resolve, reject) => {
			response.body
				.pipe(file)
				.on("finish", () => resolve())
				.on("error", reject);
		});
	});
}
