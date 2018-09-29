import { spawn } from 'child_process';

const is_windows = process.platform === 'win32';

export default function open(target: string) {
  if (is_windows) {
    spawn('cmd.exe', ['/c', 'start', '""', '/b', target.replace(/&/g, '^&')], {
      detached: true
    });
  } else {
    // TODO
  }
}
