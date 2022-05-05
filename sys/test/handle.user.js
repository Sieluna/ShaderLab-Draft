const userHandle = require("../handle/user.js");
const state = require("../config/state.js");
const debug = require("../config/debug.js");
const sequelize = require("../handle/model");
const crypto = require("crypto");
const expect = require("chai").expect;

describe("User handle test", () => {
    let code = true, userCache;
    before("Database create", () => sequelize.sync({ force: true }).then(() => sequelize.authenticate().catch(error => code = error)));
    after("Database clean", async () => await sequelize.drop());
    it("should return no error", () => expect(code).to.be.true);
    describe("Register test", () => {
        let str = 0;
        before(() => code = 0);
        it("should return the user data", async () => {
            userCache = await userHandle.register("UserHandleTest" + (++code), "UserHandleTestPassword");
            expect(userCache).to.have.property("id").to.be.equal(code);
            expect(userCache).to.have.property("name").to.be.equal("UserHandleTest" + code);
            expect(userCache).to.have.property("password").to.be.equal(crypto.createHash("md5").update("UserHandleTest" + code + "UserHandleTestPassword").digest("hex"));
        });
        it("should return error code Duplicate", async () => {
            userCache = await userHandle.register("UserHandleTest" + code, "UserHandleTestPassword");
            expect(userCache).to.be.equal(state.Duplicate);
        });
        it("should return error code oversize", async () => {
            userCache = await userHandle.register("123456789123456789", "UserHandleTestPassword");
            expect(userCache).to.be.equal(state.OverSize);
        });
        it("should return the user data with too long password", async () => {
            for (let i = 0; i < 100; i++)
                str += "123456789123456789";
            userCache = await userHandle.register("UserHandleTest" + (++code), str)
            expect(userCache).to.have.property("id").to.be.equal(code);
            expect(userCache).to.have.property("password").to.have.length(32);
        });
        it("should return the error code empty with nothing account", async () => {
            userCache = await userHandle.register("", "123456789")
            expect(userCache).to.be.equal(state.Empty);
        });
        it("should return the error code empty with nothing password", async () => {
            userCache = await userHandle.register("123456", "")
            expect(userCache).to.be.equal(state.Empty);
        });
        it("should return the user data", async () => {
            userCache = await userHandle.register("UserHandleTest" + (++code) + "@123.com", "UserHandleTestPassword")
            expect(userCache).to.have.property("id").to.be.equal(code);
            expect(userCache).to.have.property("name").to.be.equal("User_" + code);
            expect(userCache).to.have.property("email").to.be.equal("UserHandleTest" + code + "@123.com");
            expect(userCache).to.have.property("password").to.be.equal(crypto.createHash("md5").update("User_" + code + "UserHandleTestPassword").digest("hex"));
        });
        it("should return the error code duplicate with wrong password", async () => {
            userCache = await userHandle.register("UserHandleTest" + (code - 1), "123456")
            expect(userCache).to.be.equal(state.Duplicate);
        });
    });
    describe("Login test", () => {
        beforeEach(() => userCache = null);
        it("should return the user data with account login", async () => {
            userCache = await userHandle.login("User_" + code, "UserHandleTestPassword");
            expect(userCache).to.have.property("id").to.be.equal(code);
            expect(userCache).to.have.property("name").to.be.equal("User_" + code);
        });
        it("should return the user data with email login", async () => {
            userCache = await userHandle.login("UserHandleTest" + code + "@123.com", "UserHandleTestPassword");
            expect(userCache).to.have.property("id").to.be.equal(code);
            expect(userCache).to.have.property("name").to.be.equal("User_" + code);
        });
        it("should return not correct", async () => {
            userCache = await userHandle.login("UserHandleTest1", "errorerrorerrorerror");
            expect(userCache).to.be.equal(state.NotCorrect);
        });
    });
    describe("Valid test", () => {
        beforeEach(async () => userCache = await userHandle.login("User_" + code, "UserHandleTestPassword"));
        it ("should return true with correct password", async () => {
            const valid = await userHandle.valid(userCache.id, userCache.password);
            expect(valid.flag).to.be.true;
        });
    });
    describe("Get last id test", () => {
        before(async () => code = await userHandle.getLastId());
        it("should return a integer", async () => {
            let id = await userHandle.getLastId();
            debug.log(id);
            expect(id).which.is.a("number").not.below(0);
        });
        it("should return a integer with 1 offset", async () => {
            let id = await userHandle.getLastId(1);
            debug.log(id);
            expect(id).which.is.a("number").not.below(1);
        });
    });
    describe("Get all user test", () => {
        it("should return some user instance > 1", async () => {
           userCache = await userHandle.getAllUsers()
           expect(userCache.length).to.be.above(1);
       });
        it("should return a user instance", async () => {
            userCache = await userHandle.getAllUsers(1);
            expect(userCache.length).to.be.equal(1);
        });
        it("should return error empty", async () => {
            userCache = await userHandle.getAllUsers("string");
            expect(userCache).to.be.equal(state.Empty);
        });
    });
    describe("Update account test", () => {
        it("should update the name and return the state", async () => {
            let result = await userHandle.updateById(code, { name: "EmailAddUser" + code });
            let fall = await userHandle.getUserByName("EmailAddUser" + code);
            expect(fall).to.have.property("id").to.be.equal(code);
        });
        it("should update the email and return the state", async () => {
            let result = await userHandle.updateById(code, { introduction: "I am EmailAddUser" + code });
            let fall = await userHandle.getUserByName("EmailAddUser" + code);
            expect(fall).to.have.property("introduction", "I am EmailAddUser" + code);
        });
        describe("Update name by id test", async () => {
            it("should update id 1 user name", async () => {
                const data = await userHandle.updateNameById(1, "UpdateTest", "UserHandleTestPassword");
                debug.log(data, data[1]);
                let fall = await userHandle.login("UpdateTest", "UserHandleTestPassword");
                expect(fall).to.have.property("id").to.be.equal(1);
            });
        });
        describe("Update avatar by id test", async () => {
            it("should update id 1 avatar", async () => {
                await userHandle.updateAvatarById(1, "http://sdsdawdwadwad/sdawda wd/adawdawdwa");
                let fall = await userHandle.login("UpdateTest", "UserHandleTestPassword");
                expect(fall).to.have.property("avatar").to.be.equal("http://sdsdawdwadwad/sdawda wd/adawdawdwa");
            });
        });
        describe("Update email by id test", async () => {
            it("should update id 1 email", async () => {
                await userHandle.updateEmailById(1, "test@adw.com");
                let fall = await userHandle.login("UpdateTest", "UserHandleTestPassword");
                expect(fall).to.have.property("email").to.be.equal("test@adw.com");
            });
        });
        describe("Update password by id test", async () => {
            it("should update id 1 password", async () => {
                await userHandle.updatePasswordById(1, "ps1231w");
                let fall = await userHandle.login("UpdateTest", "ps1231w");
                expect(fall).to.have.property("id").to.be.equal(1);
            });
        });
        describe("Update introduction by id test", async () => {
            it("should update id 1 introduction", async () => {
                await userHandle.updateIntroductionById(1, "introduction");
                let fall = await userHandle.login("UpdateTest", "ps1231w");
                expect(fall).to.have.property("introduction").to.be.equal("introduction");
            });
        });
    });
    describe("Get user test", () => {
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
        describe("Get user by email or name test", () => {
            it("should return the user data", async () => {
                userCache = await userHandle.getUser("EmailAddUser" + code);
                expect(userCache).to.have.property("id").to.be.equal(code);
            });
            it("should return the user data", async () => {
                userCache = await userHandle.getUser("UserHandleTest" + code + "@123.com");
                expect(userCache).to.have.property("id").to.be.equal(code);
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
    });
    describe("Abort user test", () => {
        beforeEach(async () => { code = await userHandle.getLastId(); await userHandle.deprecateById(code) });
        it("should mark user to deprecated", async () => {
            expect(await userHandle.getLastId()).to.be.equal(code - 1);
        });
    });
    describe("Restore user test", () => {
        it("should mark user to active", async () => {
            code = await userHandle.getLastId();
            const result = await userHandle.restoreById(code + 1);
            debug.log(result);
            expect(await userHandle.getLastId()).to.be.equal(code + 1);
        });
    });
})
