import { Message } from "./messages";

export interface Reporter {
	silent?: boolean;
	log: (id: Message, message: string) => void;
	progress: (name: string) => Progress;
}

export interface Progress {
	start: (count?: number) => void;
	tick: () => void;
	done: () => void;
}

export const reporter: Reporter = {
	log(_id: Message, message: string) {
		if (!this.silent) console.log(message);
	},

	progress(name): Progress {
		return {
			start: () => {
				if (!this.silent) console.log(name);
			},
			tick() {},
			done() {}
		};
	}
};
