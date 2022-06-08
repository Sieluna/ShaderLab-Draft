const tagHandle = require("../handle/tag.js");
const state = require("../config/state.js");
const sequelize = require("../handle/model.js");
const expect = require("chai").expect;

describe("Tag handle test", () => {
    before("Database create", async () => sequelize.sync({ force: true }));
    after("Database clean", async () => sequelize.drop());
    before(async () => (require("../config/inject.js"))());
    describe("Create with name test", () => {
        it("should return the tags data", async () => {
            const tag = await tagHandle.create("TagTest", 1);
            expect(tag[0]).to.have.property("postId").to.be.equal(1);
            expect(tag[0]).to.have.property("name").to.be.equal("TagTest");
        });
        it("should return oversize", async () => {
            const code = await tagHandle.create("abcdabcdabcdabcdabcdabcdabcdabcdabcd", 1);
            expect(code).to.be.equal(state.OverSize);
        });
    });
    describe("Get all tags test", () => {
        it("should return all the tags data", async () => {
            const tags = await tagHandle.getAllTags();
            expect(tags).to.be.lengthOf(11);
        });
        it("should return 1 tag data", async () => {
            const tags = await tagHandle.getAllTags(1);
            expect(tags).to.be.lengthOf(1);
        });
    });
    describe("Get group tags test", () => {
        it("should return the group tags", async () => {
            let temp = {};
            const tags = await tagHandle.getGroupTags();
            for (const tag of tags) {
                temp[tag.name] = !temp[tag.name];
                expect(temp[tag.name]).to.be.true;
            }
        });
        it("should return 1 group tags", async () => {
            let temp = {};
            const tags = await tagHandle.getGroupTags(1);
            for (const tag of tags) {
                temp[tag.name] = !temp[tag.name];
                expect(temp[tag.name]).to.be.true;
            }
        });
    });
});
