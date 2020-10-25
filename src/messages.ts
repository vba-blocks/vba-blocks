export enum Message {
	UpdateAvailable = "update-available",

	BuildProjectLoading = "build-project-loading",
	BuildTargetBuilding = "build-target-building",
	BuildLockfileWriting = "build-lockfile-writing",

	ExportProjectLoading = "export-project-loading",
	ExportToStaging = "export-to-staging",
	ExportToProject = "export-to-project",

	ProjectUpdating = "project-updating",
	DependenciesResolving = "dependencies-resolving",
	DependenciesFetching = "dependencies-fetching",
	ExportLoading = "export-loading",
	PatchApplyChanges = "patch-apply-changes",
	PatchAddSrc = "patch-add-src",
	PatchRemoveSrc = "patch-remove-src",
	PatchAddDependency = "patch-add-dependency",
	PatchRemoveDependency = "patch-remove-dependency",
	PatchAddReference = "patch-add-reference",
	PatchRemoveReference = "patch-remove-reference",

	RegistrySourceLocalOnly = "registry-source-local-only",
	RegistrySourceSkipPull = "registry-source-skip-pull"
}
