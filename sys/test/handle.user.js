const userHandle = require("../handle/user.js");
const state = require("../config/state.js");
const sequelize = require("../handle/model.js");
const crypto = require("crypto");
const expect = require("chai").expect;

describe("User handle test", () => {
    let code = true, user;
    before("Database create", async () => sequelize.sync({ force: true }));
    after("Database clean", async () => sequelize.drop());
    describe("Register test", () => {
        let code = 0;
        it("should return the user data", async () => {
            const user = await userHandle.register("UserHandleTest" + (++code), "UserHandleTestPassword");
            expect(user).to.have.property("id").to.be.equal(code);
            expect(user).to.have.property("name").to.be.equal("UserHandleTest" + code);
            expect(user).to.have.property("password").to.be.equal(crypto.createHash("md5").update("UserHandleTest" + code + "UserHandleTestPassword").digest("hex"));
        });
        it("should return error code Duplicate", async () => {
            user = await userHandle.register("UserHandleTest" + code, "UserHandleTestPassword");
            expect(user).to.be.equal(state.Duplicate);
        });
        it("should return error code oversize", async () => {
            user = await userHandle.register("123456789123456789", "UserHandleTestPassword");
            expect(user).to.be.equal(state.OverSize);
        });
        it("should return the user data with too long password", async () => {
            let str = 0; for (let i = 0; i < 100; i++) str += "123456789123456789";
            user = await userHandle.register("UserHandleTest" + (++code), str)
            expect(user).to.have.property("id").to.be.equal(code);
            expect(user).to.have.property("password").to.be.lengthOf(32);
        });
        it("should return the error code empty with nothing account", async () => {
            user = await userHandle.register("", "123456789")
            expect(user).to.be.equal(state.Empty);
        });
        it("should return the error code empty with nothing password", async () => {
            user = await userHandle.register("123456", "")
            expect(user).to.be.equal(state.Empty);
        });
        it("should return the user data", async () => {
            user = await userHandle.register("UserHandleTest" + (++code) + "@123.com", "UserHandleTestPassword")
            expect(user).to.have.property("id").to.be.equal(code);
            expect(user).to.have.property("name").to.be.equal("User_" + code);
            expect(user).to.have.property("email").to.be.equal("UserHandleTest" + code + "@123.com");
            expect(user).to.have.property("password").to.be.equal(crypto.createHash("md5").update("User_" + code + "UserHandleTestPassword").digest("hex"));
        });
        it("should return the error code duplicate with wrong password", async () => {
            user = await userHandle.register("UserHandleTest" + (code - 1), "123456")
            expect(user).to.be.equal(state.Duplicate);
        });
    });
    describe("Login test", () => {
        beforeEach(() => user = null);
        it("should return the user data with account login", async () => {
            const code = await userHandle.getLastId();
            const user = await userHandle.login("User_" + code, "UserHandleTestPassword");
            expect(user).to.have.property("id").to.be.equal(code);
            expect(user).to.have.property("name").to.be.equal("User_" + code);
        });
        it("should return the user data with email login", async () => {
            const code = await userHandle.getLastId();
            const user = await userHandle.login("UserHandleTest" + code + "@123.com", "UserHandleTestPassword");
            expect(user).to.have.property("id").to.be.equal(code);
            expect(user).to.have.property("name").to.be.equal("User_" + code);
        });
        it("should return not correct", async () => {
            const code = await userHandle.login("UserHandleTest1", "errorerrorerrorerror");
            expect(code).to.be.equal(state.NotCorrect);
        });
    });
    describe("Valid test", () => {
        it ("should return true with correct password", async () => {
            const code = await userHandle.getLastId();
            const user =  await userHandle.login("User_" + code, "UserHandleTestPassword");
            const valid = await userHandle.valid(user.id, user.password);
            expect(valid.flag).to.be.true;
        });
    });
    describe("Get last id test", () => {
        it("should return a integer", async () => {
            const id = await userHandle.getLastId();
            expect(id).which.is.a("number").to.be.equal(3);
        });
        it("should return a integer with 1 offset", async () => {
            const id = await userHandle.getLastId(1);
            expect(id).which.is.a("number").to.be.equal(4);
        });
    });
    describe("Get all user test", () => {
        it("should return some user instance > 1", async () => {
           const users = await userHandle.getAllUsers();
           expect(users).which.is.a("array").to.be.lengthOf(3);
       });
        it("should return a user instance", async () => {
            const users = await userHandle.getAllUsers(1);
            expect(users).which.is.a("array").to.be.lengthOf(1);
        });
        it("should return error empty", async () => {
            const user = await userHandle.getAllUsers("string");
            expect(user).to.be.equal(state.Empty);
        });
    });
    describe("Update account test", () => {
        it("should update the name and return the state", async () => {
            const id = await userHandle.getLastId();
            const user = await userHandle.updateById(id, { name: `EmailAddUser${id}` });
            const result = await userHandle.getUserByName(`EmailAddUser${id}`);
            expect(result).to.have.property("id").to.be.equal(id);
            expect(result).to.have.property("name").to.be.equal(`EmailAddUser${id}`)
        });
        it("should update the email and return the state", async () => {
            const id = await userHandle.getLastId();
            const user = await userHandle.updateById(id, { introduction: `I am EmailAddUser${code}` });
            const result = await userHandle.getUserByName(`EmailAddUser${id}`);
            expect(result).to.have.property("id").to.be.equal(id);
            expect(result).to.have.property("introduction", `I am EmailAddUser${code}`);
        });
        describe("Update name by id test", async () => {
            it("should update id 1 user name", async () => {
                const data = await userHandle.updateNameById(1, "UpdateTest", "UserHandleTestPassword");
                expect(data[0]).to.be.equal(1);
                const fall = await userHandle.login("UpdateTest", "UserHandleTestPassword");
                expect(fall).to.have.property("id").to.be.equal(1);
            });
        });
        describe("Update avatar by id test", async () => {
            it("should update id 1 avatar", async () => {
                const data = await userHandle.updateAvatarById(1, "http://sdsdawdwadwad/sdawda wd/adawdawdwa");
                expect(data[0]).to.be.equal(1);
                const fall = await userHandle.login("UpdateTest", "UserHandleTestPassword");
                expect(fall).to.have.property("avatar").to.be.equal("http://sdsdawdwadwad/sdawda wd/adawdawdwa");
            });
        });
        describe("Update email by id test", async () => {
            it("should update id 1 email", async () => {
                const data = await userHandle.updateEmailById(1, "test@adw.com");
                expect(data[0]).to.be.equal(1);
                const fall = await userHandle.login("UpdateTest", "UserHandleTestPassword");
                expect(fall).to.have.property("email").to.be.equal("test@adw.com");
            });
        });
        describe("Update password by id test", async () => {
            it("should update id 1 password", async () => {
                const data = await userHandle.updatePasswordById(1, "ps1231w");
                expect(data[0]).to.be.equal(1);
                const user = await userHandle.login("UpdateTest", "ps1231w");
                expect(user).to.have.property("id").to.be.equal(1);
            });
        });
        describe("Update introduction by id test", async () => {
            it("should update id 1 introduction", async () => {
                const data = await userHandle.updateIntroductionById(1, "introduction");
                expect(data[0]).to.be.equal(1);
                const fall = await userHandle.login("UpdateTest", "ps1231w");
                expect(fall).to.have.property("introduction").to.be.equal("introduction");
            });
        });
    });
    describe("Get user test", () => {
        describe("Get user by id test", () => {
            it("should return the user data", async () => {
                const id = await userHandle.getLastId();
                const user = await userHandle.getUserById(id);
                expect(user).to.have.property("id").to.be.equal(id);
            });
            it("should return not exist", async () => {
                const user = await userHandle.getUserById(23333);
                expect(user).to.be.equal(state.NotExist);
            });
        });
        describe("Get user by email or name test", () => {
            it("should return the user data", async () => {
                const id = await userHandle.getLastId();
                const user = await userHandle.getUser(`EmailAddUser${id}`);
                expect(user).to.have.property("id").to.be.equal(id);
            });
            it("should return the user data", async () => {
                const id = await userHandle.getLastId();
                const user = await userHandle.getUser(`UserHandleTest${id}@123.com`);
                expect(user).to.have.property("id").to.be.equal(id);
            });
        });
        describe("Get user by name test", () => {
            it("should return the user data", async () => {
                const id = await userHandle.getLastId();
                const user = await userHandle.getUserByName(`EmailAddUser${id}`);
                expect(user).to.have.property("id").to.be.equal(id);
            });
            it("should return not exist", async () => {
                const id = await userHandle.getLastId();
                const user = await userHandle.getUserByName("A; drop table *" + id);
                expect(user).to.be.equal(state.NotExist);
            });
        });
        describe("Get user by id or name test", () => {
            it("should return the user data", async () => {
                const id = await userHandle.getLastId();
                const user = await userHandle.getUser(id);
                expect(user).to.have.property("id").to.be.equal(id);
            });
            it("should return the user data", async () => {
                const id = await userHandle.getLastId();
                const user = await userHandle.getUser(`EmailAddUser${id}`);
                expect(user).to.have.property("id").to.be.equal(id);
            });
        });
    });
    describe("Abort user test", () => {
        it("should mark user to deprecated", async () => {
            const id = await userHandle.getLastId();
            const result = await userHandle.deprecateById(id);
            expect(await userHandle.getLastId()).to.be.equal(id - 1);
        });
    });
    describe("Restore user test", () => {
        it("should mark user to active", async () => {
            const id = await userHandle.getLastId();
            const result = await userHandle.restoreById(id + 1);
            expect(await userHandle.getLastId()).to.be.equal(id + 1);
        });
    });
})
