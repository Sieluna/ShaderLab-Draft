const query = require("../handle/sql.js");
const expect = require("chai").expect;

describe("Sql handle test", () => {
    let code;
    describe("Insert test", () => {
        beforeEach(() => query('select max(user_id) as max from users').then(res => query('insert into users (user_name, user_password) values (?, ?)', ["InsertTest" + (res[0].max + 1), "InsertTestPassword"]).then(res => code = res)));
        it("should return get a object with affect rows > 1", () => {
            expect(code).to.have.property("affectedRows").equal(1);
        });
    });
    describe("Oversize test", () => {
        beforeEach(() => query('insert into users (user_name, user_password) values (?, ?)', ["tooLongtooLongtooLongtooLongtooLongtooLongtooLongtooLongtooLong", "tooLongtooLongtooLongtooLongtooLongtooLongtooLongtooLongtooLong"]).then(res => code = res));
        it("should return error code 1406", () => {
            expect(code).to.be.equal(1406);
        });
    })
    describe("Select test", () => {
       beforeEach(() => query('select * from users').then(res => code = res));
       it("should return user table", () => {
           expect(code).length.above(0);
       });
    });
    describe("Inject test", () => {
        beforeEach(() => query('select * from ?', ["users; drop table users"]).then(res => code = res));
        it("should return reject because it is a string type", () => {
           expect(code).to.be.equal(1064);
        });
    });
})