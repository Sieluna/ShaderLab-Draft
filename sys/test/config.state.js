const state = require("../config/state.js");
const expect = require("chai").expect;

describe("State test", () => {
    describe("Log test", () => {
        it("should return the state map", () => {
            const type = new state();
            console.log(type);
            console.log(state);
        });
    });
});
