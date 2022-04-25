let guid = 0;

export class Object {
    constructor(name) {
        this.name = name;
        this.instanceID = ++guid;
    }

    get getInstanceID() {
        return this.instanceID;
    }
}