const sequelize = require("../handle/model.js");
const expect = require("chai").expect;

const debug = require("../config/debug.js");

const { user } = sequelize.models;

describe("Sql handle test", () => {
    let code = true;
    before("Database create", () => sequelize.sync({ force: true }).then(() => sequelize.authenticate().catch(error => code = error)));
    after("Database clean", async () => await sequelize.drop());
    it("should return no error", () => expect(code).to.be.true);
    before(async () => await (require("../config/inject.js"))());
    describe("sequelize insert test", () => {
        it("should return the user data", async () => {
            code = await user.max("user_id");
            code = await user.create({ name: "InsertTest" + code + 1, password: "InsertTestPassword"});
            debug.log(code);
           expect(code).to.have.property("dataValues");
        });
    });
    describe("sequelize insert oversize test", () => {
        it("should return the error code from mysql", async () => {
            try {
                code = await user.create({ name: "123456789123456789", password: "InsertTestPassword"});
            } catch (error) {
                code = error;
            }
            expect(code.parent.errno).to.be.equal(1406);
        });
    });
    describe("sequelize count test", () => {
        it("should return the error code from mysql", async () => {
            code = await sequelize.models.thumb.count({ where: { postId: 1 }});
            debug.log(code);
        });
    });
});
