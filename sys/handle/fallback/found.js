const Exception = require("./shared.js");

module.exports = namespace => class NotFound extends Exception {
    constructor(message) {
        super(namespace);
        this.name = this.exceptionName;
        this.status = 404;
        this.message = message;
    }
};
