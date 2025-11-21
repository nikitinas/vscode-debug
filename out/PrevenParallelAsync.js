"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeSequential = executeSequential;
exports.setSequentialLogger = setSequentialLogger;
const array = [];
let running = false;
let output;
function log(message) {
    if (output) {
        output.appendLine(message);
    }
    else {
        console.log(message);
    }
}
function invokeNext(promiseFn) {
    log('executeSequential invokeNext');
    running = true;
    const p = promiseFn();
    p.finally(() => {
        log('executeSequential finished');
        setTimeout(() => {
            const next = array.shift();
            if (next) {
                invokeNext(next);
            }
            else {
                running = false;
            }
        });
    });
}
function executeSequential(promiseFn) {
    if (running) {
        array.push(promiseFn);
        log(`executeSequential is running, adding to array, l=${array.length}`);
    }
    else {
        invokeNext(promiseFn);
    }
}
function setSequentialLogger(channel) {
    output = channel;
}
//# sourceMappingURL=PrevenParallelAsync.js.map