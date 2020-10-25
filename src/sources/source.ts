import { Dependency } from "../manifest/dependency";
import { Registration } from "./registration";

export interface Source {
	resolve: (dependency: Dependency) => Registration[] | Promise<Registration[]>;
	fetch: (registration: Registration) => string | Promise<string>;
}
