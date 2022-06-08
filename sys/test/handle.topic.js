const topicHandle = require("../handle/topic.js");
const state = require("../config/state.js");
const sequelize = require("../handle/model.js");
const expect = require("chai").expect;

describe("Topic handle test", () => {
    let code = true, topicCache;
    before("Database create", async () => sequelize.sync({ force: true }));
    after("Database clean", async () => sequelize.drop());
    before(async () => require("../config/inject.js")());
    describe("Create with name test", () => {
        it("should return the topic data", async () => {
            topicCache = await topicHandle.createByName("TopicTest");
            expect(topicCache).to.have.property("id").to.be.equal(11);
            expect(topicCache).to.have.property("name").to.be.equal("TopicTest");
        });
        it("should return oversize", async () => {
           topicCache = await topicHandle.createByName("abcdabcdabcdabcdabcdabcdabcdabcdabcd");
           expect(topicCache).to.be.equal(state.OverSize);
        });
    });
    describe("Get topic test", () => {
        it("should return topic with string", async () => {
            topicCache = await topicHandle.getTopic("TopicTest");
            expect(topicCache).to.have.property("id").to.be.equal(11);
            expect(topicCache).to.have.property("name").to.be.equal("TopicTest");
        });
        it("should return topic with number", async () => {
            topicCache = await topicHandle.getTopic(1);
            expect(topicCache).to.have.property("id").to.be.equal(1);
        });
        it("should return new topic", async () => {
            topicCache = await topicHandle.getTopic("NewTopicTest");
            expect(topicCache).to.have.property("id").to.be.equal(12);
            expect(topicCache).to.have.property("name").to.be.equal("NewTopicTest");
        })
    });
    describe("Update topic test", async () => {
        it("should return topic", async () => {
            topicCache = await topicHandle.updateImageById(2, "image");
            expect(topicCache[0]).to.be.equal(1);
        });
        it("should return topic", async () => {
            topicCache = await topicHandle.updateDescriptionById(2, "Desc");
            expect(topicCache[0]).to.be.equal(1);
        });
    });
});
