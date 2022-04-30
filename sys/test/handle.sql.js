const sequelize = require("../handle/model.js");
const expect = require("chai").expect;

const { user } = sequelize.models;

describe("Sql handle test", () => {
    let code = true;
    before(() => sequelize.sync({ force: true }).then(() => sequelize.authenticate().catch(error => code = error)));
    after(async () => await sequelize.drop());
    it("should return no error", () => expect(code).to.be.true);
    describe("sequelize insert test", () => {
        beforeEach(() => user.max("user_id").then(id => user.create({ name: "InsertTest" + id + 1, password: "InsertTestPassword"}).then(res => code = res)));
        it("should return the user data", () => {
           expect(code).to.have.property("dataValues");
        });
    });
    describe("sequelize insert oversize test", () => {
        beforeEach(async () => {
            try {
                code = await user.create({ name: "123456789123456789", password: "InsertTestPassword"});
            } catch (error) {
                code = error;
            }
        });
        it("should return the user data", () => {
            expect(code).exist;
        });
    });
});
