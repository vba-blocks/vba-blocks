declare module "debug" {
	export default function debug(id: string): (...messages: any[]) => void;
}
