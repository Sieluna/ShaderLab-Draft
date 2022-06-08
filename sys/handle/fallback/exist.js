const Exception = require("./shared.js");

module.exports = namespace => class NotExist extends Exception {
    constructor(message) {
        super(namespace);
        this.name = this.exceptionName;
        this.status = 400;
        this.message = message;
    }
};
