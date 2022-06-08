const sequelize = require("../handle/model.js");
const expect = require("chai").expect;

describe("Sql handle test", () => {
    before("Database create", async () => sequelize.sync({ force: true }));
    after("Database clean", async () => sequelize.drop());
    describe("Database create", () => {
        it("should authenticate true", async () => {
            let success = true;
            const database = await sequelize.sync({ force: true });
            await database.authenticate().catch(err => success = err);
            expect(success).to.be.true;
        });
    });
    describe("Database clean", () => {
        it("should drop the database", async () => {
            return sequelize.drop();
        });
    });
});
