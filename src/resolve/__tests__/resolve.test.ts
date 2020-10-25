import { setupWorkspace, reset } from "../../../tests/__helpers__/project";
import { standard, complex, needsSat, unresolvable } from "../../../tests/__fixtures__";
import resolve from "../";

afterAll(reset);

test("solves standard tree", async () => {
	const { config, workspace } = await setupWorkspace(standard);
	const solution = await resolve(config, workspace);
	expect(solution).toMatchSnapshot();
});

test("solves complex tree", async () => {
	const { config, workspace } = await setupWorkspace(complex);
	const solution = await resolve(config, workspace);
	expect(solution).toMatchSnapshot();
});

test("solves needs-sat tree", async () => {
	const { config, workspace } = await setupWorkspace(needsSat);
	const solution = await resolve(config, workspace);
	expect(solution).toMatchSnapshot();
});

test("fails to solve unresolvable tree", async () => {
	const { config, workspace } = await setupWorkspace(unresolvable);
	await expect(resolve(config, workspace)).rejects.toMatchSnapshot();
});
