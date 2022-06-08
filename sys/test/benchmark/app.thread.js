const thread = require("../../thread.js")(__filename);
const cluster = require("node:cluster");

if (cluster.isMain) {
    cluster.onEvent(thread.EV_READY, () => {
        console.log("main: ready event received");
    });
    cluster.onEvent(thread.EV_ERROR, (ev, error) => {
        console.log("main: error event received");
        console.log(error);
        process.exit();
    });
    cluster.onEvent(thread.EV_SPAWNED, (ev, data) => {
        console.log("main: spawned event received");
        console.log("main: spawned event emitter should match worker id");
        console.log("main: number of forks(s) should match worker settings");
    });
}

if (cluster.isSpawn) {
    cluster.onEvent(thread.EV_SPAWNED, () => {
        console.log(`spawn: spawned event received (${cluster.cid})`);
    });
    cluster.onEvent(thread.EV_FORKED,() => {
        console.log(`spawn: fork event received (${cluster.cid})`);
    });
}

thread.start({
    "worker1a": {
        maxForks:2
    },
    "worker2a": {
        maxForks:2,
        params: ["function"]
    }
});

setTimeout(() => process.nextTick(() => process.exit(0)), 5000);
