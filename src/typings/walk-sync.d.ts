declare module "walk-sync" {
	export interface WalkOptions {
		directories: boolean;
	}
	export default function walkSync(dir: string, options?: WalkOptions): string[];
}
