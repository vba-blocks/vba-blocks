import { toLockfile } from "../toml";

describe("toLockfile", () => {
	test("should convert lockfile", () => {
		expect(
			toLockfile({
				root: {
					name: "project",
					dependencies: ["a 1.2.3"]
				},
				members: [],
				packages: [
					{
						name: "a",
						version: "1.2.3",
						source: "registry+...#...",
						dependencies: ["d 0.0.0"]
					},
					{
						name: "b",
						version: "4.5.6",
						source: "path+..."
					},
					{
						name: "c",
						version: "7.8.9",
						source: "git+...#rev"
					},
					{
						name: "d",
						version: "0.0.0",
						source: "registry+...#..."
					}
				]
			})
		).toMatchSnapshot();
	});
});
