const Exception = require("./shared.js");

module.exports = namespace => class Oversize extends Exception {
    constructor(message) {
        super(namespace);
        this.name = this.exceptionName;
        this.status = 420;
        this.message = message;
    }
};
