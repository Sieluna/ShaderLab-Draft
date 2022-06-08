const Exception = require("./shared.js");

module.exports = namespace => class UnAuthorized extends Exception {
    constructor(message) {
        super(namespace);
        this.name = this.exceptionName;
        this.status = 401;
        this.message = message;
    }
};
