const topicHandle = require("../handle/topic.js");
const state = require("../config/state.js");
const sequelize = require("../handle/model");
const userHandle = require("../handle/user");
const expect = require("chai").expect;

describe("Topic handle test", () => {
    let code = true, topicCache;
    before("Database create", () => sequelize.sync({force: true}).then(() => sequelize.authenticate().catch(error => code = error)));
    after("Database clean", async () => await sequelize.drop());
    it("should return no error", () => expect(code).to.be.true);
    describe("Create with name test", () => {
        beforeEach(() => code = 0);
        it("should return the topic data", async () => {
            topicCache = await topicHandle.createByName("TopicHandleTest" + (++code));
            expect(topicCache).to.have.property("id").to.be.equal(code);
        });
    });
    //describe("Create with full set up test", () => {
    //    beforeEach(() => code = 0);
    //    it("should return the topic data", async () => {
    //        topicCache = await topicHandle.create("TopicHandleTest" + (++code));
    //        expect(topicCache).to.have.property("id").to.be.equal(code);
    //    });
    //});
});
