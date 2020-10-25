import { Manifest } from "../manifest";
import { Project } from "../project";

export interface ProjectInfo {
	project: Project;
	dependencies: Manifest[];
	blank_target?: boolean;
}
