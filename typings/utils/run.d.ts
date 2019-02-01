export interface RunResult {
    success: boolean;
    messages: string[];
    warnings: string[];
    errors: string[];
    stdout?: string;
    stderr?: string;
}
export declare class RunError extends Error {
    result: RunResult;
    constructor(result: RunResult);
}
export default function run(application: string, file: string, macro: string, arg: string): Promise<RunResult>;
export declare function escape(value: string): string;
export declare function unescape(value: string): string;
export declare function toResult(stdout: string, stderr: string, err?: Error): RunResult;
