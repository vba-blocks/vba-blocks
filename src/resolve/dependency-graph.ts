import { Dependency } from "../manifest/dependency";
import { Registration } from "../sources/registration";

export type DependencyGraph = Registration[];

export function getRegistration(
	graph: DependencyGraph,
	dependency: Dependency
): Registration | undefined {
	return graph.find(value => value.name === dependency.name);
}
