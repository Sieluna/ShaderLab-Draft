const userHandle = require("../handle/user.js");
const state = require("../config/state.js");
const expect = require("chai").expect;

describe("User handle test", () => {
    let code, userCache;
    describe("Get last id test", () => {
        beforeEach(async () => code = await userHandle.getLastId());
        it("should return a integer", () => {
            expect(code).which.is.a("number").not.below(0);
        });
    });
    describe("Register with account test", () => {
        beforeEach(async () => userCache = await userHandle.register({ account: "UserHandleTest" + (++code), password: "UserHandleTestPassword" }));
        it("should return the user data", () => {
            expect(userCache).to.have.property("id").to.be.equal(code);
        });
    });
    describe("Register with to long account test", () => {
        beforeEach(async () => userCache = await userHandle.register({ account: "123456789123456789", password: "UserHandleTestPassword" }));
        it("should return error code oversize", () => {
            expect(userCache).to.be.equal(state.OverSize);
        });
    });
    describe("Register with to long password test", () => {
        beforeEach(async () => { let str; for (let i = 0; i < 100; i++) str += "123456789123456789"; userCache = await userHandle.register({ account: "UserHandleTest" + (++code), password: str }) });
        it("should return the user data", () => {
            expect(userCache).to.have.property("id").to.be.equal(code);
        });
    });
    describe("Register with email test", () => {
        beforeEach(async () => userCache = await userHandle.register({ account: "UserHandleTest" + (++code) + "@123.com", password: "UserHandleTestPassword" }));
        it("should return the user data", () => {
            expect(userCache).to.have.property("id").to.be.equal(code);
        });
    });
    describe("Get all user test", () => {
       beforeEach(async () => userCache = await userHandle.getAllUsers());
       it("should return some user instance > 1", () => {
           expect(userCache.length).to.be.above(1);
       });
    });
    describe("Get partial user test", () => {
        beforeEach(async () => userCache = await userHandle.getAllUsers(1));
        it("should return a user instance", () => {
            expect(userCache.length).to.be.equal(1);
        });
    });
    describe("Get user by id test", () => {
        beforeEach(async () => userCache = await userHandle.getUserById(code));
        it("should return the user data", () => {
            expect(userCache).to.have.property("id").to.be.equal(code);
        });
    });
    describe("Update account test", () => {
        beforeEach(async () => await userHandle.update(code, { name: "EmailAddUser" + code },));
        it("should return the user data", async () => {
            let fall = await userHandle.getUserByName("EmailAddUser" + code);
            expect(fall).to.have.property("id").to.be.equal(code);
        });
    });
    describe("Get user by name test", () => {
        beforeEach(async () => userCache = await userHandle.getUserByName("EmailAddUser" + code));
        it("should return the user data", () => {
            expect(userCache).to.have.property("id").to.be.equal(code);
        });
    });
})