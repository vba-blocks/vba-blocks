declare module "tomlify-j0.4" {
	export interface Options {
		space?: string | number;
		sort?: (a: string, b: string) => number;
		replace?: (key: string | number, value: any) => any;
	}
	export function toToml(value: any, options?: Options): string;
}
