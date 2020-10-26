import noop from "./noop";

// Naive implementation of https://github.com/tc39/proposal-observable
export class Observable<TValue> {
	constructor(private subscriber: Subscriber<TValue>) {}

	subscribe(observer: ObserverFunction<TValue> | Partial<Observer<TValue>>): Subscription {
		const { next = noop, error = noop, complete = noop } =
			typeof observer === "function" ? { next: observer } : observer;

		const cleanup = this.subscriber({ next, error, complete });
		const unsubscribe = () => {
			if (typeof cleanup === "function") cleanup();
		};

		return { unsubscribe };
	}
}

export interface Observer<TValue> {
	next(value: TValue): void;
	error(error: Error): void;
	complete(): void;
}

export type ObserverFunction<TValue> = (value: TValue) => void;

export interface Subscription {
	unsubscribe(): void;
}

export type Subscriber<TValue> = (observer: Observer<TValue>) => (() => void) | void;
