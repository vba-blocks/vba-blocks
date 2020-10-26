import { setupWorkspace, reset } from "../../../tests/__helpers__/project";
import { standard, complex, needsSat, unresolvable } from "../../../tests/__fixtures__";
import { solveSat } from "../sat-solver";
import { Resolver } from "../resolver";

afterAll(reset);

test("solves standard tree", async () => {
	const { config, workspace } = await setupWorkspace(standard);
	const resolver = new Resolver(config);

	const solution = await solveSat(workspace, resolver);
	expect(solution).toMatchSnapshot();
});

test("solves complex tree", async () => {
	const { config, workspace } = await setupWorkspace(complex);
	const resolver = new Resolver(config);

	const solution = await solveSat(workspace, resolver);
	expect(solution).toMatchSnapshot();
});

test("solves needs-sat tree", async () => {
	const { config, workspace } = await setupWorkspace(needsSat);
	const resolver = new Resolver(config);

	const solution = await solveSat(workspace, resolver);
	expect(solution).toMatchSnapshot();
});

test("fails to solve unresolvable tree", async () => {
	const { config, workspace } = await setupWorkspace(unresolvable);
	const resolver = new Resolver(config);

	await expect(solveSat(workspace, resolver)).rejects.toMatchSnapshot();
});
