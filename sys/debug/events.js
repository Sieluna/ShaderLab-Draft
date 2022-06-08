const { EventEmitter } = require("node:events");
const net = require("node:net");
const JsonSocket = require("json-socket");

const eventEmitter = new EventEmitter();

const defaultOptions = {
    tcpPortToMaster: 10555,
    tcpPortFromMaster: 10556,
    tcpIp: "127.0.0.1",
    verbose: false /*debug feature*/
};

let clients = {};
let serverOptions,
    serverWrite, serverRead;

function sendToEveryClients(eventName, payload) {
    eventEmitter.emit(eventName, eventName, payload);
    for (const forkId in clients) {
        sendToClient(forkId, eventName, payload);
    }
}

function sendToClient(forkId, eventName, payload) {
    if (forkId === "master") { eventEmitter.emit(eventName, eventName, payload); return; }
    if (!clients[forkId] || !clients[forkId].readSocket) return;
    clients[forkId].readSocket.sendMessage({ eventName, payload });
}

function onDataReceived(data) {
    if (data.eventName) {
        const event = data.eventName.split(":");
        if (event.length > 1) {
            if (!data.payload) data.payload = {};
            data.payload._emitter = this.socket._forkId;
            sendToClient(event[0], event[1], data.payload);
            return;
        }
        sendToEveryClients(data.eventName, data.payload);
    } else if (data.link) {
        this.socket._forkId = data.link;
        this.dup._forkId = data.link;
        clients[data.link] = clients[data.link] || {};
        switch (this.socket.type) {
            case "write":
                clients[data.link].writeSocket = this.dup;
                break;
            case "read":
                clients[data.link].readSocket = this.dup;
                break;
        }
        if (!this.dup) return;
        this.dup.sendMessage({ link: true });
    } else if (data.unlink) {
        if (clients[this.socket._forkId])
            clients[this.socket._forkId].quitting = true;
        if (!this.dup) return;
        this.dup.sendMessage({ unlink: true });
    }
}

function onClientConnected(socket, socketType) {
    socket.on("close", () => delete clients[socket._forkId]);
    socket.on("error", err => {
        if (!socket._forkId) return;
        if (!clients[socket._forkId]) return;
        if (err.message.match(/ECONNRESET/)) delete clients[socket._forkId];
    });
    let dup = new JsonSocket(socket);
    dup.on("message", onDataReceived.bind({ dup, socket }));
    dup.type = socketType;
    socket.type = socketType;
}

const server = {
    start: (opts, callback) => {
        if (typeof opts === "function") { callback = opts; opts = {}; }
        process.on("exit", server.stop);
        serverOptions = { ...defaultOptions, ...opts };
        serverRead = net.createServer(socket => onClientConnected(socket, "read"));
        serverWrite = net.createServer(socket => onClientConnected(socket, "write"));
        serverRead.listen(serverOptions.tcpPortToMaster, serverOptions.tcpIp, err => { if (err && callback) callback(err); });
        serverWrite.listen(serverOptions.tcpPortFromMaster, serverOptions.tcpIp, callback);
    },
    stop: (callback) => {
        for (const forkId in clients) {
            clients[forkId].writeSocket.end();
            clients[forkId].readSocket.end();
        }
        serverRead.close();
        serverWrite.close();
        callback && typeof callback == "function" && callback();
    },
    send: (eventName, payload) => {
        const event = eventName.split(":");
        if (event.length > 1) {
            sendToClient(event[0], event[1], payload); // to a particular fork
        } else {
            sendToEveryClients(eventName, payload); // or to every clients, include master
        }
    }
};

eventEmitter.server = server;

let clientOptions,
    socketWrite, socketRead,
    pipeWrite, pipeRead,
    connectCallback, disconnectCallback;

function onDataReceive(data) {
    if (data.eventName)
        eventEmitter.emit(data.eventName, data.eventName, data.payload);
    else if (data.link)
        connectCallback && !connectCallback.alreadyFired && (connectCallback.alreadyFired = true) && connectCallback();
    else if (data.unlink)
        disconnectCallback && !disconnectCallback.alreadyFired && (disconnectCallback.alreadyFired = true) && disconnectCallback();
}

function connectToMasterProcess (callback) {
    socketWrite = new JsonSocket(new net.Socket());
    socketRead = new JsonSocket(new net.Socket());

    socketWrite.type = "write";
    socketRead.type = "read";

    socketWrite.connect(clientOptions.tcpPortToMaster, clientOptions.tcpIp);
    socketRead.connect(clientOptions.tcpPortFromMaster, clientOptions.tcpIp);

    socketWrite.on("connect", () => {
        pipeWrite = socketWrite;
        pipeWrite.on("message", onDataReceive.bind(socketWrite));
        pipeWrite.sendMessage({ link: clientOptions.forkId, pid: clientOptions.pid });
    });
    socketRead.on("connect", () => {
        pipeRead = socketRead;
        pipeRead.on("message", onDataReceive.bind(socketRead));
        connectCallback = callback;
        pipeRead.sendMessage({ link: clientOptions.forkId, pid: clientOptions.pid });
    });
}

const client = {
    connect: (opts, callback) => {
        if (typeof opts === "function") { callback = opts; opts = {}; }
        clientOptions = { ...defaultOptions, ...opts };
        connectToMasterProcess(callback);
    },
    disconnect: (callback) => {
        disconnectCallback = callback;

        if (pipeWrite) pipeWrite.sendMessage({ unlink: true });
        if (pipeRead) pipeRead.sendMessage({ unlink: true });

        setTimeout(() => {
            socketWrite.end();
            socketRead.end();
        }, 500);
    },
    send: (eventName, payload) => {
        const event = eventName.split(":");
        if (event.length > 1 && event[0] === clientOptions.forkId)
            return eventEmitter.emit(event[1], eventName, payload);
        const data = { eventName, payload };
        if (pipeWrite) pipeWrite.sendMessage(data);
        return JSON.stringify(data).length;
    }
};

eventEmitter.client = client;

const temp = eventEmitter.on;

eventEmitter.on = (eventName, fnc) => {
    if (typeof eventName == "object") {
        eventName.forEach(event => temp.apply(eventEmitter, [Object.keys(event)[0], event[Object.keys(event)[0]]]));
        return;
    }
    temp.apply(eventEmitter, [eventName, fnc]);
};

module.exports = eventEmitter;
