export function getRegistration(graph, dependency) {
    return graph.find(value => value.name === dependency.name);
}
