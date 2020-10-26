import dedent from "@timhall/dedent";
import { CliError, ErrorCode } from "../errors";
import { Target, TargetType } from "../manifest/target";
import { Project } from "../project";
import { sanitize } from "../utils/path";

export interface TargetInfo {
	target: Target;
	blankTarget: boolean;
}

export function getTarget(project: Project, targetType: string | undefined): TargetInfo {
	let target: Target | undefined;
	let blankTarget = false;
	if (targetType) {
		if (project.manifest.target) {
			// For defined target, --target TYPE must match target.type
			if (project.manifest.target.type === targetType) {
				target = project.manifest.target;
			}
		} else {
			// Create blank target for --target TYPE
			const type = <TargetType>targetType;
			const name = project.manifest.name;

			target = {
				type,
				name,
				path: "target",
				filename: `${sanitize(name)}.${type}`
			};
			blankTarget = true;
		}

		if (!target) {
			throw new CliError(
				ErrorCode.TargetNoMatching,
				`No matching target found for type "${targetType}" in project.`
			);
		}
	} else if (project.manifest.target) {
		// Build [target]
		target = project.manifest.target;
	}

	if (!target) {
		throw new CliError(
			ErrorCode.TargetNoDefault,
			dedent`
        No default target found for project.

        Use --target TYPE for a blank target
        or specify 'project.target' in vba-block.toml.

        Example vba-block.toml:

        [project]
        target = "xlsm"
      `
		);
	}

	return { target, blankTarget };
}
