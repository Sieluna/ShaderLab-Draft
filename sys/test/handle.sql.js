const sequelize = require("../handle/model.js");
const expect = require("chai").expect;

const debug = require("../config/debug.js");

const { user, thumb, post, topic } = sequelize.models;

describe("Sql handle test", () => {
    let code = true;
    before("Database create", () => sequelize.sync({ force: true }).then(() => sequelize.authenticate().catch(error => code = error)));
    after("Database clean", async () => await sequelize.drop());
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
        it("should return the error code from mysql", () => {
            expect(code.parent.errno).to.be.equal(1406);
        });
    });
    describe("sequelize count test", () => {
       beforeEach(async () => {
           await user.create({ name: "User0", password: "233"});
           await topic.create({ name: "Topic0"})
           await post.create({name: "Post0", content: "233", userId:1, topicId: 1})
           await thumb.create({ userId: 1, postId: 1});
           code = await sequelize.models.thumb.count({ where: { postId: 1 }});
       });
        it("should return the error code from mysql", () => {
            debug.log(code);
            expect(code).to.be.equal(1);
        });
    });
});
