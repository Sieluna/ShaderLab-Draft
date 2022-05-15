const tagHandle = require("../handle/tag.js");
const state = require("../config/state.js");
const debug = require("../config/debug.js");
const sequelize = require("../handle/model.js");
const expect = require("chai").expect;

describe("Tag handle test", () => {
    let code = true, tagCache;
    before("Database create", () => sequelize.sync({force: true}).then(() => sequelize.authenticate().catch(error => code = error)));
    after("Database clean", async () => await sequelize.drop());
    it("should return no error", () => expect(code).to.be.true);
    before(async () => await (require("../config/inject.js"))());
    describe("Get all tags test", () => {
        it("should return all the tags data", async () => {
            tagCache = await tagHandle.getAllTags();
            debug.log(tagCache);
            expect(tagCache.length).to.be.equal(10);
        });
        it("should return 1 tag data", async () => {
            tagCache = await tagHandle.getAllTags(1);
            debug.log(tagCache);
            expect(tagCache.length).to.be.equal(1);
        });
    });
    describe("Get group tags test", () => {
        it("should return the group tags", async () => {
            let temp = {};
            tagCache = await tagHandle.getGroupTags();
            for (const tag of tagCache) {
                temp[tag.name] = !temp[tag.name];
                expect(temp[tag.name]).to.be.true;
            }
        });
    });
    describe("Create with name test", () => {
        it("should return the tags data", async () => {
            tagCache = await tagHandle.create("TagTest", 1);
            debug.log(tagCache);
            expect(tagCache[0]).to.have.property("postId").to.be.equal(1);
            expect(tagCache[0]).to.have.property("name").to.be.equal("TagTest");
        });
        it("should return oversize", async () => {
            tagCache = await tagHandle.create("abcdabcdabcdabcdabcdabcdabcdabcdabcd", 1);
            debug.log(tagCache);
            expect(tagCache).to.be.equal(state.OverSize);
        });
    });
});
