import { relative } from "../../utils/path";
import { truncate } from "../../utils/text";
import { Component } from "../component";

export function normalizeComponent(component: Component, dir: string): Component {
	return {
		type: component.type,
		name: component.name,
		code: truncate(component.code, 200),
		details: {
			path: component.details.path && relative(dir, component.details.path)
		},
		binary_path: component.binary_path,
		filename: component.filename
	};
}
