import { writeFile } from "../utils/fs";
import parallel from "../utils/parallel";
import { basename, join } from "../utils/path";
import { BuildGraph, ImportGraph } from "./build-graph";

export default async function stageBuildGraph(
	graph: BuildGraph,
	staging: string
): Promise<ImportGraph> {
	const components = await parallel(graph.components, async component => {
		const path = join(staging, component.filename);
		await writeFile(path, component.code);

		if (component.binary_path) {
			const binary_path = join(staging, basename(component.binary_path));
			await writeFile(binary_path, component.details.binary);
		}

		return { name: component.name, path };
	});

	return {
		name: graph.name,
		components,
		references: graph.references
	};
}
