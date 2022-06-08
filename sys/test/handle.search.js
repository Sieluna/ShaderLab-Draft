const searchHandle = require("../handle/search.js");
const state = require("../config/state.js");
const sequelize = require("../handle/model.js");
const expect = require("chai").expect;

describe("Search handle test", () => {
    before("Database create", async () => sequelize.sync({ force: true }));
    after("Database clean", async () => sequelize.drop());
    before(async () => require("../config/inject.js")());
    describe("Search post test", () => {
        it("should return some result", async () => {
            const result = await searchHandle.searchPostsByName("de", 1);
            expect(result).to.be.lengthOf(1);
        });
        it("should be fail with no limit", async () => {
            const result = await searchHandle.searchPostsByName("de");
            expect(result).to.be.lengthOf(10);
        });
        it("should return none with none", async () => {
            const result = await searchHandle.SearchPostsByContent("none");
            expect(result).to.be.equal(state.NotExist);
        });
        it("should be ok with no keywords", async () => {
            const result = await searchHandle.SearchPostsByContent("e");
            expect(result).to.be.lengthOf(10);
        });
    });
});
