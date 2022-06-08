const Exception = require("./shared.js");

module.exports = namespace => class LackSize extends Exception {
    constructor(message) {
        super(namespace);
        this.name = this.exceptionName;
        this.status = 419;
        this.message = message;
    }
};
