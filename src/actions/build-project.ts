import dedent from "@timhall/dedent";
import { env } from "../env";
import { writeLockfile } from "../lockfile";
import { isRegistryDependency } from "../manifest/dependency";
import { Message } from "../messages";
import { fetchDependencies, loadProject } from "../project";
import { toDependency } from "../sources/registration";
import { buildTarget, getTarget } from "../targets";
import { BuildOptions } from "../targets/build-target";
import { join } from "../utils/path";

export async function buildProject(options: BuildOptions = {}): Promise<string> {
	env.reporter.log(Message.BuildProjectLoading, `[1/3] Loading project...`);

	const project = await loadProject();
	const { target, blankTarget } = getTarget(project, options.target);

	// Fetch relevant dependencies
	const dependencies = await fetchDependencies(project);

	// Build target
	const displayDependencies = project.packages.map(registration => {
		const dependency = toDependency(registration);

		if (isRegistryDependency(dependency))
			return `${registration.id} registry+${dependency.registry}`;
		else return `${registration.id} ${registration.source}`;
	});
	env.reporter.log(
		Message.BuildTargetBuilding,
		dedent`
      \n[2/3] Building target "${target.type}" for "${project.manifest.name}"...
      ${displayDependencies.length ? `\nDependencies:\n${displayDependencies.join("\n")}` : ""}`
	);

	await buildTarget(target, { project, dependencies, blankTarget }, options);

	// Update lockfile (if necessary)
	const skip = !project.hasDirtyLockfile;
	env.reporter.log(
		Message.BuildLockfileWriting,
		`\n[3/3] Writing lockfile...${skip ? " (skipped, no changes)" : ""}`
	);
	if (!skip) {
		await writeLockfile(project.paths.root, project);
	}

	return join(project.paths.dir, "build", target.filename);
}
