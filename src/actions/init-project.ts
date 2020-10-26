import dedent from "@timhall/dedent";
import { env } from "../env";
import { CliError, ErrorCode } from "../errors";
import { Manifest, writeManifest } from "../manifest";
import { TargetType } from "../manifest/target";
import { initProject as init } from "../project";
import { addTarget } from "../targets/add-target";
import { ensureDir, pathExists, writeFile } from "../utils/fs";
import { init as git_init } from "../utils/git";
import { basename, extname, join } from "../utils/path";

export interface InitOptions {
	name?: string;
	dir?: string;
	target?: string;
	from?: string;
	pkg: boolean;
	git: boolean;
}

export async function initProject(options: InitOptions) {
	let { name, dir = env.cwd, target: targetType, from, pkg: asPackage, git } = options;

	if (await pathExists(join(dir, "vba-block.toml"))) {
		throw new CliError(
			ErrorCode.InitAlreadyInitialized,
			`A vba-blocks project already exists in this directory.`
		);
	}

	if (from && !(await pathExists(from))) {
		throw new CliError(ErrorCode.FromNotFound, `The "from" document was not found at "${from}".`);
	}

	name = name || (from ? basename(from, extname(from)) : basename(dir));

	if (!name) {
		throw new CliError(
			ErrorCode.InitNameRequired,
			dedent`
        Unable to determine name from current directory or --from.
        --name NAME is required to initialize this project.
      `
		);
	}
	if (!targetType && !from && name.includes(".")) {
		const parts = name.split(".");
		targetType = parts.pop();
		name = parts.join(".");
	}

	if (!asPackage && !targetType && !from) {
		throw new CliError(
			ErrorCode.InitTargetRequired,
			dedent`
        --target or --from is required for vba-blocks projects.
        (e.g. vba-blocks init --target xlsm)
      `
		);
	}

	await ensureDir(join(dir, "src"));

	if (git && !(await pathExists(join(dir, ".git")))) {
		await git_init(dir);
		await writeFile(join(dir, ".gitignore"), `/build`);
		await writeFile(
			join(dir, ".gitattributes"),
			`* text=auto\n*.bas text eol=crlf\n*.cls text eol=crlf`
		);
		await writeFile(
			join(dir, ".editorconfig"),
			dedent`
        [*]
        trim_trailing_whitespace = true
        insert_final_newline = true
        charset = utf-8

        [*.{bas,cls}]
        end_of_line = crlf
      `
		);
	}

	const project = await init(name, dir, {
		type: asPackage ? "package" : "project"
	});

	if (from) {
		targetType = extname(from).replace(".", "");
	}
	if (targetType) {
		const dependencies: Manifest[] = [];
		await addTarget(<TargetType>targetType, { project, dependencies }, { from });
	}

	await writeManifest(project.manifest, project.paths.dir);
}
