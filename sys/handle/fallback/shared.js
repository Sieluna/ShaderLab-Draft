module.exports = class Exception {
    constructor(...namespace) {
        this.namespace = namespace;
    }

    get exceptionName() {
        return `${this.namespace.join("_")}_${this.constructor.name}`.toUpperCase();
    }
}
