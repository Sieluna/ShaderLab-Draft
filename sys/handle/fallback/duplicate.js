const Exception = require("./shared.js");

module.exports = namespace => class Duplicate extends Exception {
    constructor(message) {
        super(namespace);
        this.name = this.exceptionName;
        this.status = 425;
        this.message = message;
    }
};
