const devMode = process.env.NODE_ENV != "production";

if (devMode) {

    const app = require("./base.js");

    require("./page.js")(app);
    require("./api.js")(app);

    module.exports = app;

} else {

    const thread = require("./thread.js")(__filename);
    const cluster = require("node:cluster");

    if (cluster.isMain) {

        cluster.onEvent(thread.EV_READY, () => {
            console.log("master: ready event received");
        });
        cluster.onEvent(thread.EV_ERROR, (ev, error) => {
            console.log("master: error event received");
            console.log(error);
            process.exit();
        });
        cluster.onEvent(thread.EV_SPAWNED, (ev, data) => {
            console.log("master: spawned event received");
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
        page: {
            maxForks: "2",
            params: [8080]
        },
        api: {
            maxForks: "2",
            params: [8000]
        },
    });

}
