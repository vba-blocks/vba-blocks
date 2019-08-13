import dedent from 'dedent/macro';
import { CliError, ErrorCode } from '../errors';
import { sanitize, join } from '../utils/path';

import { Project } from '../types';
import { Target, TargetType } from '../manifest/types';

export default function getTarget(project: Project, target_type: string | undefined): Target {
  let target: Target | undefined;
  if (target_type) {
    if (project.manifest.target) {
      // For defined target, --target TYPE must match target.type
      if (project.manifest.target.type === target_type) {
        target = project.manifest.target;
      }
    } else {
      // Create blank target for --target TYPE
      const type = <TargetType>target_type;
      const name = project.manifest.name;

      target = {
        type,
        name,
        path: 'target',
        filename: `${sanitize(name)}.${type}`,
        blank: true
      };
    }

    if (!target) {
      throw new CliError(
        ErrorCode.TargetNoMatching,
        `No matching target found for type "${target_type}" in project.`
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

  return target;
}
