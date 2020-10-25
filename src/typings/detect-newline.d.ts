declare module "detect-newline" {
	export default function detectNewline(input: string): string | null;
	export function graceful(input: string): string;
}
