const searchHandle = require("../handle/search.js");
const postHandle = require("../handle/post.js");
const state = require("../config/state.js");
const debug = require("../config/debug.js");
const sequelize = require("../handle/model");
const userHandle = require("../handle/user");
const topicHandle = require("../handle/topic");
const expect = require("chai").expect;


describe("Search handle test", () => {
    let code = true, searchCache;
    before("Database create", () => sequelize.sync({ force: true }).then(() => sequelize.authenticate().catch(error => code = error)));
    after("Database clean", async () => await sequelize.drop());
    it("should return no error", () => expect(code).to.be.true);
    describe("Search post test", () => {
        before(async () => {
            for (let i = 0; i < 10; i++) {
                await userHandle.register("PostNameTest" + i, "PostTestPSW");
                await topicHandle.create("TopicNameTest" + i, "http://none", "This is Topic Name" + i);
            }
            await postHandle.create(1, 1, { name: "PostSearch", content: "Some random info" });
            await postHandle.create(1, 1, { name: "SearchPost", content: "Some random info" });
        });
        it("should return some result", async () => {
            const result = await searchHandle.searchPostsByName("Se", 1);
            expect(result.length).to.be.equal(1);
            debug.log(result);
        });
        it("should be fail with no limit", async () => {
            const result = await searchHandle.searchPostsByName("o");
            expect(result.length).to.be.equal(2);
            debug.log(result);
        });
        it("should return none with none", async () => {
            const result = await searchHandle.SearchPostsByContent("none");
            expect(result.length).to.be.equal(0);
            debug.log(result);
        });
        it("should be ok with no keywords", async () => {
            const result = await searchHandle.SearchPostsByContent("e");
            expect(result.length).to.be.equal(2);
            debug.log(result);
        });
    });
});
