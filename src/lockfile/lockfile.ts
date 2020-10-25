import { Dependency } from "../manifest/dependency";
import { DependencyGraph } from "../resolve/dependency-graph";

export interface MinimalSnapshot {
	name: string;
	dependencies: Dependency[];
}

export const LOCKFILE_VERSION = "1";

/**
 * ## Lockfile
 *
 * Save resolved dependency graph and workspace information
 * for precisely rebuilding dependency graph if the workspace hasn't changed
 *
 * Version the lockfile separately from vba-blocks to allow the lockfile format to change over time,
 * while staying isolated from the more-frequent changes to the vba-blocks version.
 */
export interface Lockfile {
	metadata?: { version: string };
	workspace: {
		root: MinimalSnapshot;
		members: MinimalSnapshot[];
	};
	packages: DependencyGraph;
}
