import { Manifest } from "../../src/manifest";
import { Dependency, RegistryDependency } from "../../src/manifest/dependency";

export default function createManifest(options: any): Manifest {
	const {
		package: pkg,
		project,
		src = [],
		references = [],
		devSrc = [],
		devReferences = []
	} = options;

	const { name = "testing", version = "0.0.0", authors = [], publish = false, target } =
		pkg || project;
	const dependencies =
		options.dependencies && !Array.isArray(options.dependencies)
			? toDependencies(options.dependencies)
			: options.dependencies || [];
	const devDependencies =
		options.devDependencies && !Array.isArray(options.devDependencies)
			? toDependencies(options.devDependencies)
			: options.devDependencies || [];

	return {
		type: pkg ? "package" : "project",
		name,
		version,
		metadata: { authors, publish },
		src,
		dependencies,
		references,
		devSrc,
		devDependencies,
		devReferences,
		target
	};
}

function toDependencies(values: any): Dependency[] {
	const dependencies: RegistryDependency[] = [];
	for (const [name, version] of Object.entries(values)) {
		dependencies.push({
			name,
			version: <string>version,
			registry: "vba-blocks"
		});
	}

	return dependencies;
}
