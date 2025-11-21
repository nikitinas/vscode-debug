type PromiseProvider = () => Promise<unknown>;
const array: PromiseProvider[] = [];
let running = false;

function invokeNext(promiseFn: PromiseProvider) {
  console.log('executeSequential invokeNext');
  running = true;
  const p = promiseFn();
  p.finally(
    () => {
      // running = false;
      console.log('executeSequential finished');
      setTimeout(() => {
        const next = array.shift();
        if (next) invokeNext(next); else running = false;
      });
    }
  );
}

export function executeSequential(promiseFn: PromiseProvider) {
  if (running) {
    array.push(promiseFn);
    console.log('executeSequential is running, adding to array, l=', array.length);
  } else {
    invokeNext(promiseFn);
  }
}
