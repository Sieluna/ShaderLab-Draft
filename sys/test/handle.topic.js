const topicHandle = require("../handle/topic.js");
const state = require("../config/state.js");
const debug = require("../config/debug.js");
const sequelize = require("../handle/model.js");
const expect = require("chai").expect;

describe("Topic handle test", () => {
    let code = true, topicCache;
    before("Database create", () => sequelize.sync({force: true}).then(() => sequelize.authenticate().catch(error => code = error)));
    after("Database clean", async () => await sequelize.drop());
    it("should return no error", () => expect(code).to.be.true);
    describe("Create with name test", () => {
        it("should return the topic data", async () => {
            topicCache = await topicHandle.createByName("TopicTest");
            debug.log(topicCache);
            expect(topicCache).to.have.property("id").to.be.equal(1);
            expect(topicCache).to.have.property("name").to.be.equal("TopicTest");
        });
        it("should return oversize", async () => {
           topicCache = await topicHandle.createByName("abcdabcdabcdabcdabcdabcdabcdabcdabcd");
            debug.log(topicCache);
           expect(topicCache).to.be.equal(state.OverSize);
        });
    });
    describe("Get topic test", () => {
        it("should return topic with string", async () => {
            topicCache = await topicHandle.getTopic("TopicTest");
            debug.log(topicCache);
            expect(topicCache).to.have.property("id").to.be.equal(1);
            expect(topicCache).to.have.property("name").to.be.equal("TopicTest");
        });
        it("should return topic with number", async () => {
            topicCache = await topicHandle.getTopic(1);
            debug.log(topicCache);
            expect(topicCache).to.have.property("id").to.be.equal(1);
            expect(topicCache).to.have.property("name").to.be.equal("TopicTest");
        });
        it("should return new topic", async () => {
            topicCache = await topicHandle.getTopic("NewTopicTest");
            debug.log(topicCache);
            expect(topicCache).to.have.property("id").to.be.equal(2);
            expect(topicCache).to.have.property("name").to.be.equal("NewTopicTest");
        })
    });
    describe("Update topic test", async () => {
        it("should return topic", async () => {
            topicCache = await topicHandle.updateImageById(2, "image");
            debug.log(topicCache);
            expect(topicCache[0]).to.be.equal(1);
        });
        it("should return topic", async () => {
            topicCache = await topicHandle.updateDescriptionById(2, "Desc");
            debug.log(topicCache);
            expect(topicCache[0]).to.be.equal(1);
        });
    });
});
