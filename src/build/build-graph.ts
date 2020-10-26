import { Reference } from "../manifest/reference";
import { Source } from "../manifest/source";
import { Component } from "./component";

export interface FromDependences {
	components: Map<Component, string>;
	references: Map<Reference, string>;
}

export interface BuildGraph {
	name: string;
	components: Component[];
	references: Reference[];
	fromDependencies: FromDependences;
}

export interface ImportGraph {
	name: string;
	components: Source[];
	references: Reference[];
}
