import { devExport, standardExport } from "../../../tests/__fixtures__";
import { reset, setupEnvironment } from "../../../tests/__helpers__/project";
import loadFromExport from "../load-from-export";
import { normalizeBuildGraph } from "../__helpers__/build-graph";

afterAll(reset);

test("should load BuildGraph from exported project", async () => {
	setupEnvironment(standardExport);

	const graph = await loadFromExport(standardExport);
	expect(normalizeBuildGraph(graph)).toMatchSnapshot();
});

test("should load dev-src from exported project", async () => {
	setupEnvironment(devExport);

	const graph = await loadFromExport(devExport);
	expect(normalizeBuildGraph(graph)).toMatchSnapshot();
});
