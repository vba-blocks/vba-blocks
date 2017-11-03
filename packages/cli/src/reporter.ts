export default class Reporter {
  progress(name?: string) {
    return new Progress();
  }
}

export class Progress {
  start(count?: number) {}
  tick() {}
  done() {}
}
