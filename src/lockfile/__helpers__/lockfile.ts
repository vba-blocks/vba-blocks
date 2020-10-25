export function normalizeLockfile(lockfile: string): string {
	return lockfile.replace(/vba\-blocks v\d.\d.\d/g, "vba-blocks v#.#.#");
}
