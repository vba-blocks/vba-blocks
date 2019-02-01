import { Progress } from '../types';
export interface ParallelOptions {
    concurrency?: number;
    progress?: Progress;
}
export default function parallel<T, U>(values: T[], fn: (value: T) => U | Promise<U>, options?: ParallelOptions): Promise<U[]>;
