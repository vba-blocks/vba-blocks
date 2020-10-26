import { asyncMap } from "../utils/async-map";
import { BuildGraph } from "./build-graph";
import * as editorConfig from "./transforms/editor-config";

const transforms = [editorConfig];

export const toCompiled = asyncMap<BuildGraph>(
	...transforms.map(transform => transform.toCompiled).filter(Boolean)
);
export const toSrc = asyncMap<BuildGraph>(
	...transforms.map(transform => transform.toSrc).filter(Boolean)
);
