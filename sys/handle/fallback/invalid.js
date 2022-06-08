const Exception = require("./shared.js");

module.exports = namespace => class Invalid extends Exception {
    constructor(message) {
        super(namespace);
        this.name = this.exceptionName;
        this.status = 406;
        this.message = message;
    }
};
