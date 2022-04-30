const userHandle = require("../handle/user.js");
const state = require("../config/state.js");
const sequelize = require("../handle/model");
const expect = require("chai").expect;

describe("User handle test", () => {
    let code = true, userCache;
    before(() => sequelize.sync({ force: true }).then(() => sequelize.authenticate().catch(error => code = error)));
    after(async () => await sequelize.drop());
    it("should return no error", () => expect(code).to.be.true);
    describe("Register with account test", () => {
        beforeEach(() => code = 0);
        it("should return the user data", async () => {
            userCache = await userHandle.register("UserHandleTest" + (++code), "UserHandleTestPassword");
            expect(userCache).to.have.property("id").to.be.equal(code);
        });
    });
    describe("Login test", () => {
        it("should return the user data", async () => {
            userCache = await userHandle.login("UserHandleTest" + code, "UserHandleTestPassword");
            expect(userCache).to.have.property("id").to.be.equal(code);
        });
        it("should return not correct", async () => {
            userCache = await userHandle.login("UserHandleTest" + code, "errorerrorerrorerror");
            expect(userCache).to.be.equal(state.NotCorrect);
        });
    });
    describe("Register with to long account test", () => {
        it("should return error code oversize", async () => {
            userCache = await userHandle.register("123456789123456789", "UserHandleTestPassword");
            expect(userCache).to.be.equal(state.OverSize);
        });
    });
    describe("Register with to long password test", () => {
        let str;
        beforeEach(async () => { for (let i = 0; i < 100; i++) str += "123456789123456789"; });
        it("should return the user data", async () => {
            userCache = await userHandle.register("UserHandleTest" + (++code), str)
            expect(userCache).to.have.property("id").to.be.equal(code);
        });
    });
    describe("Register with nothing account test", () => {
        it("should return empty", async () => {
            userCache = await userHandle.register("", "123456789")
            expect(userCache).to.be.equal(state.Empty);
        });
    });
    describe("Register with nothing password test", () => {
        it("should return the user data", async () => {
            userCache = await userHandle.register("123456", "")
            expect(userCache).to.be.equal(state.Empty);
        });
    });
    describe("Register with email test", () => {
        beforeEach(async () => userCache = await userHandle.register("UserHandleTest" + (++code) + "@123.com", "UserHandleTestPassword"));
        it("should return the user data", () => {
            expect(userCache).to.have.property("id").to.be.equal(code);
        });
    });
    describe("Register with wrong password test", () => {
        it("should return the user data", async () => {
            userCache = await userHandle.register("UserHandleTest" + (code - 1), "123456")
            expect(userCache).to.be.equal(state.Duplicate);
        });
    });
    describe("Get last id test", () => {
        beforeEach(async () => code = await userHandle.getLastId());
        it("should return a integer", () => {
            expect(code).which.is.a("number").not.below(0);
        });
    });
    describe("Get all user test", () => {
       it("should return some user instance > 1", async () => {
           userCache = await userHandle.getAllUsers()
           expect(userCache.length).to.be.above(1);
       });
    });
    describe("Get partial user test", () => {
        it("should return a user instance", async () => {
            userCache = await userHandle.getAllUsers(1);
            expect(userCache.length).to.be.equal(1);
        });
        it("should return error empty", async () => {
            userCache = await userHandle.getAllUsers("string");
            expect(userCache).to.be.equal(state.Empty);
        })
    });
    describe("Property update test", () => {
        it("i dont know", () => {
            const obj = { a: "1", b: "2", c: "3", d: "4" };
            for (const objKey in obj) {
                console.log(objKey, typeof objKey, obj[objKey]);
            }
        });
    });
    describe("Update account test", () => {
        it("should return the state", async () => {
            let result = await userHandle.updateById(code, { name: "EmailAddUser" + code });
            console.log(result);
            let fall = await userHandle.getUserByName("EmailAddUser" + code);
            expect(fall).to.have.property("id").to.be.equal(code);
        });
    });
    describe("Update account other", () => {
        it ("should return the state", async () => {
            let result = await userHandle.updateById(code, { introduction: "I am EmailAddUser" + code });
            console.log(result);
            let fall = await userHandle.getUserByName("EmailAddUser" + code);
            expect(fall).to.have.property("introduction", "I am EmailAddUser" + code);
        })
    });
    describe("Get user by id test", () => {
        it("should return the user data", async () => {
            userCache = await userHandle.getUserById(code);
            expect(userCache).to.have.property("id").to.be.equal(code);
        });
        it("should return not exist", async () => {
            userCache = await userHandle.getUserById(23333);
            expect(userCache).to.be.equal(state.NotExist);
        });
    });
    describe("Get user by name test", () => {
        it("should return the user data", async () => {
            userCache = await userHandle.getUserByName("EmailAddUser" + code);
            expect(userCache).to.have.property("id").to.be.equal(code);
        });
        it("should return not exist", async () => {
            userCache = await userHandle.getUserByName("A; drop table *" + code);
            expect(userCache).to.be.equal(state.NotExist);
        });
    });
    describe("Get user by id or name test", () => {
        it("should return the user data", async () => {
            userCache = await userHandle.getUser(code);
            expect(userCache).to.have.property("id").to.be.equal(code);
        });
        it("should return the user data", async () => {
            userCache = await userHandle.getUser("EmailAddUser" + code);
            expect(userCache).to.have.property("id").to.be.equal(code);
        });
    });
    describe("Abort user test", () => {
        beforeEach(async () => { code = await userHandle.getLastId(); await userHandle.deprecateById(code) });
        it("should mark user to deprecated", async () => {
            expect(await userHandle.getLastId()).to.be.equal(code - 1);
        });
    });
    describe("Restore user test", () => {
        beforeEach(async () => { code = await userHandle.getLastId(); await userHandle.restoreById(code + 1) });
        it("should mark user to active", async () => {
            expect(await userHandle.getLastId()).to.be.equal(code + 1);
        });
    });
})
