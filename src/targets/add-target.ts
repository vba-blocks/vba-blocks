import { createDocument, exportTo } from "../addin";
import { CliError, ErrorCode } from "../errors";
import { writeManifest } from "../manifest";
import { Target, TargetType } from "../manifest/target";
import { copy, emptyDir, ensureDir, remove } from "../utils/fs";
import { basename, extname, join, resolve, sanitize } from "../utils/path";
import buildTarget from "./build-target";
import exportTarget, { extractTarget } from "./export-target";
import { ProjectInfo } from "./project-info";

export interface AddOptions {
	from?: string;
	name?: string;
	path?: string;
}

export default async function addTarget(
	type: TargetType,
	info: ProjectInfo,
	options: AddOptions = {}
) {
	const { project } = info;
	let { from, name = project.manifest.name, path = "target" } = options;

	if (project.manifest.target) {
		throw new CliError(
			ErrorCode.TargetAlreadyDefined,
			`A target is already defined for this project.`
		);
	}

	const staging = join(project.paths.staging, "export");
	await ensureDir(staging);
	await emptyDir(staging);

	try {
		let target: Target;
		if (from) {
			// For from, use
			// - use name of file for name of target
			// - copy file to build/
			// - run standard export on file
			from = resolve(from);
			name = basename(from, extname(from));

			target = project.manifest.target = {
				name,
				type,
				path: join(project.paths.dir, path),
				filename: `${sanitize(name)}.${type}`
			};

			await copy(from, join(project.paths.build, target.filename));
			await exportTo(project, target, staging);
			await exportTarget(target, info, staging);
		} else {
			// For standard add-target, don't want to remove any existing src
			// - create blank document
			// - extract target only
			// - rebuild target
			target = project.manifest.target = {
				name,
				type,
				path: join(project.paths.dir, path),
				filename: `${sanitize(name)}.${type}`
			};

			await createDocument(project, target);

			const extracted = await extractTarget(project, target, staging);
			await remove(target.path);
			await copy(extracted, target.path);

			await buildTarget(target, info);
		}

		await writeManifest(project.manifest, project.paths.dir);
	} catch (err) {
		throw err;
	} finally {
		// Finally, cleanup staging
		await remove(staging);
	}
}
