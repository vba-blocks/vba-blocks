import dedent from "@timhall/dedent";
import { CliError, ErrorCode } from "../errors";
import { Manifest } from "../manifest";
import { Reference } from "../manifest/reference";
import { Project } from "../project";
import { BuildOptions } from "../targets/build-target";
import { joinCommas } from "../utils/text";
import { BuildGraph, FromDependences } from "./build-graph";
import { byComponentName, Component } from "./component";

export async function loadFromProject(
	project: Project,
	dependencies: Manifest[],
	options: BuildOptions = {}
): Promise<BuildGraph> {
	let includedDependencies = dependencies;
	if (options.release) {
		const devDependencies = project.manifest.devDependencies.map(dependency => dependency.name);
		includedDependencies = dependencies.filter(manifest => {
			return !devDependencies.includes(manifest.name);
		});
	}

	const manifests = [project.manifest, ...includedDependencies];
	const loadingComponents: Promise<Component>[] = [];
	const references: Reference[] = [];
	const foundReferences: { [name_guid: string]: boolean } = {};
	const fromDependencies: FromDependences = { components: new Map(), references: new Map() };

	// Load components and references from project and dependencies
	for (const manifest of manifests) {
		for (const source of manifest.src) {
			loadingComponents.push(
				Component.load(source.path, { binary_path: source.binary }).then(component => {
					if (manifest !== project.manifest) {
						fromDependencies.components.set(component, manifest.name);
					}

					return component;
				})
			);
		}
		for (const reference of manifest.references) {
			const nameGuid = `${reference.name}_${reference.guid}`;
			if (foundReferences[nameGuid]) continue;

			references.push(reference);
			if (manifest !== project.manifest) {
				fromDependencies.references.set(reference, manifest.name);
			}

			foundReferences[nameGuid] = true;
		}
	}

	if (!options.release) {
		for (const source of project.manifest.devSrc) {
			loadingComponents.push(Component.load(source.path, { binary_path: source.binary }));
		}
		for (const reference of project.manifest.devReferences) {
			const nameGuid = `${reference.name}_${reference.guid}`;
			if (foundReferences[nameGuid]) continue;

			references.push(reference);
			foundReferences[nameGuid] = true;
		}
	}

	const components = (await Promise.all(loadingComponents)).sort(byComponentName);
	const graph = { name: "VBAProject", components, references, fromDependencies };

	validateGraph(project, graph);
	return graph;
}

function validateGraph(project: Project, graph: BuildGraph) {
	const componentsByName: { [name: string]: string[] } = {};
	const referencesByName: { [name: string]: Reference[] } = {};
	const errors = [];

	for (const component of graph.components) {
		if (!componentsByName[component.name]) componentsByName[component.name] = [];

		const manifestName = graph.fromDependencies.components.get(component) || project.manifest.name;
		componentsByName[component.name].push(manifestName);
	}
	for (const reference of graph.references) {
		if (!referencesByName[reference.name]) referencesByName[reference.name] = [];
		referencesByName[reference.name].push(reference);
	}

	for (const [name, from] of Object.entries(componentsByName)) {
		if (from.length > 1) {
			const names = from.map(name => `"${name}"`);
			errors.push(`Source "${name}" is present in manifests named ${joinCommas(names)}`);
		}
	}
	for (const [name, references] of Object.entries(referencesByName)) {
		if (references.length > 1) {
			const versions = references.map(reference => `${reference.major}.${reference.minor}`);
			errors.push(`Reference "${name}" has multiple versions: ${joinCommas(versions)}`);
		}
	}

	if (errors.length) {
		throw new CliError(
			ErrorCode.BuildInvalid,
			dedent`
        Invalid build:

        ${errors.join("\n")}
      `
		);
	}
}
