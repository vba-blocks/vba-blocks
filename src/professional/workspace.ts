import { Manifest } from "../manifest";

export interface Workspace {
	paths: {
		root: string;
		members: string[];
	};
	root: Manifest;
	members: Manifest[];
}

export async function loadWorkspace(manifest: Manifest, dir: string): Promise<Workspace> {
	return {
		paths: {
			root: dir,
			members: []
		},
		root: manifest,
		members: []
	};
}
