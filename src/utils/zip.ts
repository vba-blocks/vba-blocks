import { createWriteStream } from "fs";
import { __default } from "./interop";

export async function zip(dir: string, file: string): Promise<void> {
	const { create: createArchive } = (await import("archiver")).default;

	return new Promise<void>((resolve, reject) => {
		try {
			const output = createWriteStream(file);
			const archive = createArchive("zip");

			output.on("close", () => resolve());
			output.on("error", reject);

			archive.pipe(output);
			archive.on("error", reject);

			archive.directory(dir, "/");
			archive.finalize();
		} catch (err) {
			reject(err);
		}
	});
}

export interface UnzipOptions {
	filter?: (file: UnzipFile, index: number, files: UnzipFile[]) => boolean;
	map?: (file: UnzipFile, index: number, files: UnzipFile[]) => UnzipFile;
	plugins?: UnzipPlugin[];
	strip?: number;
}
export type UnzipPlugin = (buffer: Buffer) => Promise<UnzipFile[]>;

export interface UnzipFile {
	data: Buffer;
	mode: number;
	mtime: string;
	path: string;
	type: string;
}

export async function unzip(file: string, dest: string, options?: UnzipOptions): Promise<void> {
	const decompress = __default(await import("decompress"));

	await decompress(file, dest, options);
}
