import { ok } from "assert";
import { Progress } from "../reporter";

export interface ParallelOptions {
	concurrency?: number;
	progress?: Progress;
}

const DEFAULT_CONCURRENCY = 4;

export default async function parallel<T, U>(
	values: T[],
	fn: (value: T) => U | Promise<U>,
	options: ParallelOptions = {}
): Promise<U[]> {
	const { concurrency = DEFAULT_CONCURRENCY, progress } = options;
	const queue = Array.from(values);
	let results: any[] = [];

	ok(concurrency >= 1, "parallel: options.concurrency must be at least 1");

	if (progress) progress.start(queue.length);

	while (queue.length) {
		const items = queue.splice(0, concurrency);
		results = results.concat(
			await Promise.all(
				items.map(async item => {
					const result = await fn(item);
					if (progress) progress.tick();
					return result;
				})
			)
		);
	}

	if (progress) progress.done();

	return results;
}
