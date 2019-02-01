import { ok } from 'assert';
import { satisfies } from 'semver';
import * as logicSolver from 'logic-solver';
import { isRegistryDependency } from '../manifest/dependency';
import unique from '../utils/unique';
const { Solver, exactlyOne, atMostOne, implies, or } = logicSolver;
export async function solve(workspace, resolver) {
    const dependencies = workspace.root.dependencies;
    await resolveDependencies(dependencies, resolver);
    const required = await optimizeResolved(resolver.graph, dependencies);
    const solver = new Solver();
    for (const [name, resolved] of resolver) {
        const { registered } = resolved;
        const isRequired = required.includes(name);
        const ids = registered.map(registration => registration.id);
        if (isRequired) {
            solver.require(exactlyOne(...ids));
        }
        else {
            solver.require(atMostOne(...ids));
        }
    }
    const reversed = [...resolver].reverse();
    for (const [name, resolved] of reversed) {
        const { registered } = resolved;
        for (const registration of registered) {
            for (const dependency of registration.dependencies) {
                const resolved = resolver.graph.get(dependency.name);
                ok(resolved, `Dependency "${dependency.name}" hasn't been resolved`);
                const matching = getMatching(dependency, resolved);
                solver.require(implies(registration.id, or(...matching)));
            }
        }
    }
    const solution = solver.solve();
    if (!solution) {
        throw new Error('Failed to resolve dependency graph for given manifest');
    }
    const ids = solution.getTrueVars();
    const graph = ids.map(id => resolver.getRegistration(id)).filter(isRegistration);
    return graph;
    function isRegistration(value) {
        return value != null;
    }
}
export async function resolveDependencies(dependencies, resolver) {
    const resolved = await Promise.all(dependencies.map(dependency => resolver.get(dependency)));
    for (const resolution of resolved) {
        const { registered } = resolution;
        await Promise.all(registered.map(registration => resolveDependencies(registration.dependencies, resolver)));
    }
}
export async function optimizeResolved(graph, dependencies) {
    const required = [];
    const topLevel = {};
    for (const dependency of dependencies) {
        const { name } = dependency;
        required.push(name);
        if (isRegistryDependency(dependency)) {
            topLevel[name] = dependency.version;
        }
    }
    for (const [name, resolution] of graph) {
        const { registered } = resolution;
        const range = topLevel[name] || unique(resolution.range).join(' || ');
        resolution.registered = registered
            .filter(registration => satisfies(registration.version, range))
            .reverse();
    }
    return required;
}
function getMatching(dependency, resolved) {
    const { registered } = resolved;
    if (isRegistryDependency(dependency)) {
        const { version } = dependency;
        return registered
            .filter(registration => satisfies(registration.version, version))
            .map(registration => registration.id);
    }
    else {
        return [];
    }
}
