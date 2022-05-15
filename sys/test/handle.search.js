const searchHandle = require("../handle/search.js");
const state = require("../config/state.js");
const debug = require("../config/debug.js");
const sequelize = require("../handle/model.js");
const expect = require("chai").expect;

describe("Search handle test", () => {
    let code = true;
    before("Database create", () => sequelize.sync({ force: true }).then(() => sequelize.authenticate().catch(error => code = error)));
    after("Database clean", async () => await sequelize.drop());
    it("should return no error", () => expect(code).to.be.true);
    before(async () => await (require("../config/inject.js"))());
    describe("Search post test", () => {
        it("should return some result", async () => {
            const result = await searchHandle.searchPostsByName("de", 1);
            expect(result.length).to.be.equal(1);
            debug.log(result);
        });
        it("should be fail with no limit", async () => {
            const result = await searchHandle.searchPostsByName("de");
            expect(result.length).to.be.equal(10);
            debug.log(result);
        });
        it("should return none with none", async () => {
            const result = await searchHandle.SearchPostsByContent("none");
            expect(result).to.be.equal(state.NotExist);
            debug.log(result);
        });
        it("should be ok with no keywords", async () => {
            const result = await searchHandle.SearchPostsByContent("e");
            expect(result.length).to.be.equal(10);
            debug.log(result);
        });
    });
});
