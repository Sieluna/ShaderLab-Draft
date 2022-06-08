const sessionHandle = require("../handle/session.js");
const sequelize = require("../handle/model.js");
const expect = require("chai").expect;

const store = new sessionHandle();

describe("Session handle test", () => {
    const sessionId = "1234a", sessionData = { foo: "bar", baz: "42" };
    before("Database create", async () => sequelize.sync({ force: true }));
    after("Database clean", async () => sequelize.drop());
    describe("Set session test", () => {
        before(() => store.sync());
        it("should save the session", done => {
            store.set(sessionId, sessionData, (err, session) => {
                expect(err).to.be.null;
                expect(session).to.be.ok;
                store.length((err, count) => {
                    expect(err).to.be.null;
                    expect(count).to.be.equal(1);
                    store.get(sessionId, (err, data) => {
                        expect(err).to.be.null;
                        store.destroy(sessionId, err => {
                            expect(err).to.be.null;
                            done();
                        });
                    });
                });
            });
        });
        it("should have a future expires", done => {
            store.set(sessionId, sessionData, (err, session) => {
                expect(err).to.be.null;
                expect(session).to.be.ok;
                expect(session).to.have.property("expires").
                                which.is.a("Date");
                store.destroy(sessionId, err => {
                    expect(err).to.be.null;
                    done();
                });
            });
        });
        it("should have model instance methods", done => {
            store.set(sessionId, sessionData, (err, session) => {
                expect(err).to.be.null;
                expect(session).to.be.ok;
                expect(session).to.have.property("dataValues");
                expect(session).to.have.property("update");
                expect(session).to.have.property("save");
                store.destroy(sessionId, err => {
                    expect(err).to.be.null;
                    done();
                });
            });
        });
    });
});
