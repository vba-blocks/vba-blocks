import { KnownProps as EditorConfig, parse } from "editorconfig";
import env from "../../env";
import parallel from "../../utils/parallel";
import { extname } from "../../utils/path";
import { BY_LINE } from "../../utils/text";
import { BuildGraph } from "../build-graph";
import { Component } from "../component";

const debug = env.debug("vba-blocks:editor-config");
const cache: Map<string, EditorConfig> = new Map();

export async function toCompiled(graph: BuildGraph): Promise<BuildGraph> {
	return graph;
}

export async function toSrc(graph: BuildGraph): Promise<BuildGraph> {
	// First, normalize line-endings to CRLF
	const { name, references, from_dependencies } = graph;
	const components = await parallel(graph.components, formatComponent);

	return { name, components, references, from_dependencies };
}

async function formatComponent(component: Component): Promise<Component> {
	const { end_of_line, trim_trailing_whitespace, insert_final_newline } = await loadEditorConfig(
		component
	);
	const new_line = end_of_line === "lf" ? "\n" : "\r\n";

	const code = component.code;
	const lines = code.split(BY_LINE);
	const transformed_code = lines
		.map(trim_trailing_whitespace ? trimTrailingWhitespace : passthrough)
		.join(new_line);

	component.code = insert_final_newline ? insertFinalNewline(transformed_code) : transformed_code;

	return component;
}

async function loadEditorConfig(component: Component): Promise<EditorConfig> {
	const extension = extname(component.filename);
	if (cache.has(extension)) return cache.get(extension)!;

	const config = await parse(component.filename);
	cache.set(extension, config);

	debug(`Formatting ${extension} with`, config);

	return config;
}

function trimTrailingWhitespace(line: string): string {
	return line.trimEnd();
}

function insertFinalNewline(code: string): string {
	if (code[code.length - 1] !== "\n") code += "\n";
	return code;
}

function passthrough(line: string): string {
	return line;
}
