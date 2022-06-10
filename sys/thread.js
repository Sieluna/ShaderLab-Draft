const debug = require("debug")("shaderlab:thread");
const { EventEmitter } = require("node:events");
const { spawn } = require("node:child_process");
const cluster = require("node:cluster");
const path = require("node:path");
const async = require("async");

class Thread extends EventEmitter {
    constructor(execFile) {
        super();

        this.EV_FORKED = "thread.forked";
        this.EV_SPAWNED = "thread.spawned";
        this.EV_ERROR = "thread.error";
        this.EV_READY = "thread.ready";
        this.EV_CLUSTER_READY = "clusterReady";

        this.EV_SPAWN_EXIT_SUCCESS = "thread.spawnExitSuccess";
        this.EV_SPAWN_EXIT_ERROR = "thread.spawnExitWithError";
        this.EV_SPAWN_EXIT_SUCCESS_ALL = "thread.spawnExitSuccessAll";

        this.EV_FORK_EXIT_SUCCESS = "thread.forkExitSuccess";
        this.EV_FORK_EXIT_ERROR = "thread.forkExitWithError";

        this.forksErrorCount = {};
        this.forksExitedNormaly = 0;

        this.events = require("./debug/events.js");

        this.config = {
            threadArgs: require("minimist")(process.argv.slice(2)),
            clusterArgs: JSON.parse(JSON.stringify(process.argv)).slice(2),
            mainFile: execFile,
            binPath: path.resolve(process.execPath),
            workersDir: path.dirname(execFile),
            spawnOptions: {
                env: { ...process.env, DEBUG_COLORS: 1 },
                windowsHide: !process.execPath.match(/node/),
            },
            eventsOptions: { verbose: false }
        };

        cluster.thread = this;
        cluster.onEvent = this.onEvent.bind(this);
        cluster.sendEvent = this.sendEvent.bind(this);

        if (this.isMain) {
            cluster.isMain = true;
            cluster.isSpawn = false;
            cluster.isFork = false;
            cluster.isLastFork = false;
            cluster.cid = "main";
            process.on("exit", this.killSpawns.bind(this));
            this.config.eventsOptions.forkId = this.config.threadArgs.worker || "master";
        } else if (this.isSpawn) {
            cluster.isMain = false;
            cluster.isSpawn = true;
            cluster.isFork = false;
            cluster.isLastFork = false;
            cluster.forceClient = true;
            cluster.cid = this.config.threadArgs.worker;
            this.config.eventsOptions.forkId = this.config.threadArgs.worker || "master";
        } else if (this.isFork) {
            cluster.isMain = false;
            cluster.isSpawn = false;
            cluster.isFork = true;
            cluster.isLastFork = this.config.threadArgs.forkNumber === this.config.threadArgs.maxForks;
            cluster.forkNumber = this.config.threadArgs.forkNumber;
            cluster.cid = `${this.config.threadArgs.worker}:${cluster.forkNumber}`;
            this.config.eventsOptions.forkId = `${this.config.threadArgs.worker}#${cluster.forkNumber}`;
        }
    }

    onEvent(eventName, fnc) {
        if (typeof fnc == "function") {
            this.events.on(eventName, fnc);
        }
    }

    get isMain() {
        return !this.isSpawn && !this.isFork;
    }

    get isSpawn() {
        return this.config.threadArgs.worker && !this.config.threadArgs.forkNumber;
    }

    get isFork() {
        return !!parseInt(this.config.threadArgs.forkNumber);
    }

    runCode(callback) {
        let evExitError = `master:${cluster.isFork ? this.EV_FORK_EXIT_ERROR : this.EV_SPAWN_EXIT_ERROR}`;

        process.on("uncaughtException", err => {
            this.sendEvent(`master:${this.EV_ERROR}`, err.stack);
            this.sendEvent(evExitError, { error: err.stack, workerId: cluster.cid });
            process.exit(1);
        });

        process.on("unhandledRejection", err => {
            this.sendEvent(`master:${this.EV_ERROR}`, err.stack);
            this.sendEvent(evExitError, { error: err.stack, workerId: cluster.cid });
            process.exit(1);
        });

        process.on("warning", err => {
            console.warn("Thread received a warning from nodejs: ", err.message);
        });

        try {
            const workerId = this.config.threadArgs.worker;
            if (this.workers[workerId].params) {
                const module = require(path.resolve(this.config.workersDir, workerId));
                if (typeof module == "function")
                    module.apply(module, this.workers[workerId].params);
            } else {
                require(path.resolve(this.config.workersDir, workerId));
            }
        } catch (err) {
            setTimeout(() => {
                this.sendEvent(`master:${this.EV_ERROR}`, err.stack);
                this.sendEvent(evExitError, { error: err.stack, workerId: cluster.cid });
                process.exit(1);
            }, 500);
        }

        callback && callback();
    }

    respawnWorker(workerId) {
        setTimeout(() => {
            this.spawnWorker(workerId)
        }, this.workers[workerId].respawnNextInterval);
    }

    spawnWorker(workerId, callback) {
        const worker = this.workers[workerId];

        worker.alreadySpawned = true;

        if (worker.disable) return callback && callback();

        const args = [];

        process.execArgv.forEach(arg => args.push(arg));

        args.push(this.config.mainFile);
        args.push(`--worker=${workerId}`);

        if (worker.maxForks) args.push(`--maxForks=${worker.maxForks}`);

        process.argv.forEach(arg => {
            if (arg.match(/^--/)) args.push(arg);
        });

        if (!worker.respawnInterval) {
            worker.respawnInterval = 1000;
            worker.respawnNextInterval = 1000;
        }

        if (worker.spawnCount) {
            if (worker.spawnCount < 10)
                worker.respawnNextInterval = worker.respawnInterval * worker.spawnCount;
            worker.spawnCount++;
        } else {
            worker.spawnCount = 1;
        }

        debug("spawnWorker %s: binPath=%s, spawnOptions=%o", workerId, this.config.binPath, { windowsHide: this.config.spawnOptions.windowsHide });
        worker.spawn = spawn(this.config.binPath, args, this.config.spawnOptions);

        worker.spawn.stdout.pipe(process.stdout);
        worker.spawn.stderr.pipe(process.stderr);

        worker.spawn.id = workerId;

        worker.spawn.on("close", exitCode => {
            if (exitCode > 0) { this.respawnWorker(String(worker.spawn.id)); return; }

            this.killed = true;

            this.sendCrossEvent(`master:${this.EV_SPAWN_EXIT_SUCCESS}`, { spawn: worker.spawn.id, code: exitCode });

            this.workers[worker.spawn.id].exited = true;

            let exitedCount = 0, exitedWanted = 0;

            for (const w in this.workers) {
                if (!this.workers[w].disable) {
                    exitedWanted++;
                    if (this.workers[w].exited) exitedCount++;
                }
            }

            if (exitedCount === exitedWanted)
                this.sendCrossEvent(`master:${this.EV_SPAWN_EXIT_SUCCESS_ALL}`);
        });

        worker.spawn.on("error", () => {
            this.respawnWorker(worker.spawn.id);
        });

        callback && callback();
    }

    spawnWorkers(callback) {
        this.spawned = 0;

        let workersCount = 0, firstWorkerId;

        for (const workerId in this.workers) {
            if (!this.workers[workerId].disable) {
                if (!firstWorkerId) firstWorkerId = workerId;
                workersCount++;
            }
        }

        this.onEvent(this.EV_SPAWNED, () => {
            this.spawned++;
            if (this.spawned >= workersCount && !this.alreadySendReady) {
                this.sendEvent("master:" + this.EV_READY);
                this.alreadySendReady = true;
            } else {
                // spawn next worker
                const spawnFindForNextEnabled = num => {
                    if (num > Object.keys(this.workers).length) return null;
                    const w = Object.keys(this.workers)[num];
                    if (!this.workers[w]) return null;
                    if (!this.workers[w].disable) {
                        if (!this.workers[w].alreadySpawned)
                            return w;
                    }
                    return spawnFindForNextEnabled(num + 1);
                }

                const w = spawnFindForNextEnabled(this.spawned);
                if (w) this.spawnWorker(w);
            }
        });

        // spawn first worker
        if (firstWorkerId) this.spawnWorker(firstWorkerId);
        callback && callback();
    }

    killSpawns() {
        async.mapValues(this.workers, (worker, workerId, next) => {
            if (this.workers[workerId].spawn && !this.workers[workerId].spawn.killed) {
                debug("killSpawns: %s => kill()", workerId);
                this.workers[workerId].spawn.kill();
            }
            next();
        });
    }

    spawnFork() {
        const connectEventAndRunCode = callback => {
            this.events.client.connect(this.config.eventsOptions, (err) => {
                if (err && callback) { callback(err); return; }
                this.runCode(callback);
            });
        }
        const maxForks = parseInt(this.config.threadArgs.maxForks);
        const workerId = this.config.threadArgs.worker;

        if (cluster.forkNumber) {
            connectEventAndRunCode(() => {
                process.nextTick(() => {
                    debug("forked, sending %s", `${workerId}:${this.EV_FORKED}`);
                    this.sendEvent(`${workerId}:${this.EV_FORKED}`, { forkNumber: cluster.forkNumber, pid: process.pid });
                    this.sendEvent(`master:${this.EV_FORKED}`, { forkNumber: cluster.forkNumber, pid: process.pid });
                });
            });
            return;
        }

        if (!maxForks) {
            connectEventAndRunCode(() => {
                process.nextTick(() => {
                    debug("no forks required, sending %s", `master:${this.EV_SPAWNED}`);
                    this.sendEvent(`master:${this.EV_SPAWNED}`, { forks: 0, pid: process.pid });
                });
                this.sendEvent(`${workerId}:${this.EV_SPAWNED}`, { forks: 0, pid: process.pid });
            });
            return;
        }

        connectEventAndRunCode(() => {
            // worker has forks, wait for all forks to be ready
            this.workers[workerId].forked = 0;

            this.onEvent(this.EV_SPAWNED, () => {
                debug("all forks has been forked, sending %s", `master:${this.EV_SPAWNED}`);
                this.sendEvent(`master:${this.EV_SPAWNED}`, { forks: this.workers[workerId].forked, pid: process.pid });
            });

            this.onEvent(this.EV_FORKED, () => {
                this.workers[workerId].forked++;
                if (this.workers[workerId].forked === this.config.threadArgs.maxForks) {
                    debug("all forks has been forked, sending %s", `${workerId}:${this.EV_SPAWNED}`);
                    this.sendEvent(`${workerId}:${this.EV_SPAWNED}`, { forks: this.workers[workerId].forked, pid: process.pid });
                }
            });

            cluster.setupPrimary({ args: this.config.clusterArgs, silent: true });

            for (let i = 0; i < maxForks; i++) {
                debug("forking %o", cluster.settings);
                this.forkSelf(i);
            }
        });
    }

    forkSelf(forkNumber) {
        cluster.settings.args.push(`--forkNumber=${forkNumber + 1}`);
        const worker = cluster.fork();
        worker.process.stdout.pipe(process.stdout);
        worker.process.stderr.pipe(process.stderr);

        worker.on("exit", (code, signal) => {
            if (code === 0) {
                // normal exit
                this.sendCrossEvent(`master:${this.EV_FORK_EXIT_SUCCESS}`, { workerId: cluster.cid, forkNumber, code: 0 });
                this.forksExitedNormaly += 1;
                debug("fork %s#%s exit code %s, signal %s", cluster.cid, forkNumber, code, signal);
                if (this.forksExitedNormaly === this.config.threadArgs.maxForks) process.exit();
            } else {
                // error exit
                debug("fork %s#%s exit code %s, signal %s", cluster.cid, forkNumber, code, signal);
                if (!this.forksErrorCount[forkNumber]) this.forksErrorCount[forkNumber] = 0;
                this.forksErrorCount[forkNumber] += 1;
                if (this.forksErrorCount[forkNumber] < 3) {
                    setTimeout(() => this.forkSelf(forkNumber), 1000 * this.forksErrorCount[forkNumber]);
                }
            }
        });

        cluster.settings.args.pop();
        return worker;
    }

    start(workers) {
        this.workers = workers;
        if (cluster.isSpawn || cluster.isFork) {
            cluster.options = this.workers[this.config.threadArgs.worker].options || {};
            this.spawnFork();
            return;
        }
        this.onEvent(this.EV_READY, () => this.sendEvent(this.EV_CLUSTER_READY));
        async.series([
            next => this.events.server.start(this.config.eventsOptions, next),
            next => this.spawnWorkers(next)
        ]);
    }

    sendCrossEvent(eventName, data) {
        debug("send cross region event %s", eventName, data ?? "");
        this.events[cluster.isMain ? "server" : "client"].send(eventName, data);
    }

    sendEvent(eventName, data) {
        if (eventName.match(/thread\./)) { this.sendCrossEvent(eventName, data); return; }
        if (eventName.match(/#/)) { this.sendCrossEvent(eventName, data); return; }
        if (!eventName.match(/:/)) { this.sendCrossEvent(eventName, data); return; }
        if (eventName.match(/^master:/)) { this.sendCrossEvent(eventName, data); return; }
        const tmp = eventName.split(":"), workerId = tmp[0], name = tmp[1];
        if (this.workers && this.workers[workerId]) {
            if (this.workers[workerId].maxForks) {
                for (let i = 1; i <= this.workers[workerId].maxForks; i++) {
                    this.sendCrossEvent(`${workerId}#${i}:${name}`, data); // send to forks
                }
            }
            this.sendCrossEvent(eventName, data); // send to spawned
        }
    }
}

module.exports = exec => new Thread(exec);
