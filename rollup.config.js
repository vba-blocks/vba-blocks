import builtin from "builtin-modules";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import resolve from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import { terser } from "rollup-plugin-terser";
import typescript from "@rollup/plugin-typescript";

const mode = process.env.NODE_ENV || "production";

export default [
	{
		input: ["src/index.ts", "src/bin/vba-blocks.ts", "src/debug.ts"],
		output: {
			format: "cjs",
			dir: "lib",
			sourcemap: true,
			exports: "auto"
		},
		external: [...builtin],
		plugins: [
			resolve(),
			replace({
				"process.env.NODE_ENV": JSON.stringify(mode),
				"process.env.READABLE_STREAM": '"disable"',
				"require.cache": "{}"
			}),
			commonjs({
				include: "node_modules/**"
			}),
			json(),
			typescript(),
			mode === "production" && terser(),
			readableStream(),
			debug(),
			workerThreads()
		].filter(Boolean),
		onwarn(warning, warn) {
			// Ignore known errors
			if (warning.code === "CIRCULAR_DEPENDENCY" && /glob/.test(warning.importer)) return;
			if (warning.code === "EVAL" && /minisat/.test(warning.id)) return;

			warn(warning);
		}
	}
];

// Explicitly export modern API from readable-stream
// (exclude fallback API)
function readableStream() {
	const isReadable = /readable\-stream[\\,\/]readable\.js/;
	const isPassthrough = /readable\-stream[\\,\/]passthrough\.js/;
	const isDuplex = /readable\-stream[\\,\/]duplex\.js/;

	return {
		name: "readable-stream",
		load(id) {
			if (isReadable.test(id)) {
				return {
					code: `
            const Stream = require('stream');

            exports = module.exports = Stream.Readable;
            exports.Readable = Stream.Readable;
            exports.Writable = Stream.Writable;
            exports.Duplex = Stream.Duplex;
            exports.Transform = Stream.Transform;
            exports.PassThrough = Stream.PassThrough;
            exports.Stream = Stream;
          `
				};
			}
			if (isPassthrough.test(id)) {
				return {
					code: `module.exports = require('stream').PassThrough;`
				};
			}
			if (isDuplex.test(id)) {
				return {
					code: `module.exports = require('stream').Duplex;`
				};
			}

			return null;
		}
	};
}

function debug() {
	const isBrowser = /debug[\\,\/]src[\\,\/]browser\.js/;

	return {
		name: "debug",
		load(id) {
			if (isBrowser.test(id)) {
				return {
					code: `module.exports = {};`
				};
			}
		}
	};
}

function workerThreads() {
	const isWorkerThreads = /worker_threads/;

	return {
		name: "worker_threads",
		resolveId(importee) {
			if (isWorkerThreads.test(importee)) {
				return importee;
			}
		},
		load(id) {
			if (isWorkerThreads.test(id)) {
				return {
					code: `export const threadId = 0;`
				};
			}
		}
	};
}
