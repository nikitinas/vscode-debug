import type { OutputChannel } from 'vscode';

type PromiseProvider = () => Promise<unknown>;
const array: PromiseProvider[] = [];
let running = false;
let output: OutputChannel | undefined;

function log(message: string): void {
  if (output) {
    output.appendLine(message);
  } else {
    console.log(message);
  }
}

function invokeNext(promiseFn: PromiseProvider) {
  log('executeSequential invokeNext');
  running = true;
  const p = promiseFn();
  p.finally(() => {
    log('executeSequential finished');
    setTimeout(() => {
      const next = array.shift();
      if (next) {
        invokeNext(next);
      } else {
        running = false;
      }
    });
  });
}

export function executeSequential(promiseFn: PromiseProvider) {
  if (running) {
    array.push(promiseFn);
    log(`executeSequential is running, adding to array, l=${array.length}`);
  } else {
    invokeNext(promiseFn);
  }
}

export function setSequentialLogger(channel: OutputChannel): void {
  output = channel;
}
