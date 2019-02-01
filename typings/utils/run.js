import { promisify } from 'util';
const exec = promisify(require('child_process').exec);
import env from '../env';
import { join } from './path';
import { pathExists } from './fs';
import { runScriptNotFound } from '../errors';
const debug = require('debug')('vba-blocks:run');
export class RunError extends Error {
    constructor(result) {
        const message = result.errors.join('\n') || 'An unknown error occurred.';
        super(message);
        this.result = result;
    }
}
export default async function run(application, file, macro, arg) {
    const script = join(env.scripts, env.isWindows ? 'run.vbs' : 'run.applescript');
    if (!(await pathExists(script))) {
        throw runScriptNotFound(script);
    }
    const parts = [application, file, macro, env.isWindows ? escape(arg) : arg];
    const command = env.isWindows
        ? `cscript //Nologo "${script}" ${parts.map(part => `"${part}"`).join(' ')}`
        : `osascript '${script}' ${parts.map(part => `'${part}'`).join(' ')}`;
    debug('params:', { application, file, macro, arg });
    debug('command:', command);
    let result;
    try {
        const { stdout, stderr } = await exec(command);
        result = toResult(stdout, stderr);
    }
    catch (err) {
        result = toResult(err.stdout, err.stderr, err);
    }
    if (!result.success) {
        throw new RunError(result);
    }
    debug('result:', result);
    return result;
}
export function escape(value) {
    // Checked DOS escape characters: http://www.robvanderwoude.com/escapechars.php
    // and only quotes inside of quoted arguments to vbscript seemed to cause issues
    return value.replace(/\"/g, '^q');
}
export function unescape(value) {
    return value.replace(/\^q/g, '"');
}
export function toResult(stdout, stderr, err) {
    let success = false;
    let messages = [];
    let warnings = [];
    let errors = [];
    if (stdout) {
        try {
            // For vba-blocks run, check for standard JSON result
            const parsed = JSON.parse(stdout);
            if ('success' in parsed && ('messages' in parsed || 'errors' in parsed)) {
                ({ success, messages = [], warnings = [], errors = [] } = parsed);
            }
            else {
                throw new Error('(ok, non-standard response)');
            }
        }
        catch (err) {
            success = true;
            messages = [stdout];
        }
    }
    if (err) {
        success = false;
        errors.push(unescape(err.message));
    }
    if (stderr) {
        success = false;
        errors.push(stderr);
    }
    return { success, messages, warnings, errors, stdout, stderr };
}
