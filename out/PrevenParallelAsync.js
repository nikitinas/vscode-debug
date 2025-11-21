"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeSequential = executeSequential;
const array = [];
let running = false;
function invokeNext(promiseFn) {
    console.log('executeSequential invokeNext');
    running = true;
    const p = promiseFn();
    p.finally(() => {
        // running = false;
        console.log('executeSequential finished');
        setTimeout(() => {
            const next = array.shift();
            if (next)
                invokeNext(next);
            else
                running = false;
        });
    });
}
function executeSequential(promiseFn) {
    if (running) {
        array.push(promiseFn);
        console.log('executeSequential is running, adding to array, l=', array.length);
    }
    else {
        invokeNext(promiseFn);
    }
}
//# sourceMappingURL=PrevenParallelAsync.js.map