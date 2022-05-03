const postHandle = require("../handle/post.js");
const userHandle = require("../handle/user.js");
const topicHandle = require("../handle/topic.js");
const state = require("../config/state.js");
const debug = require("../config/debug.js");
const sequelize = require("../handle/model");
const expect = require("chai").expect;

describe("Post handle test", () => {
    let code = true, postCache;
    before("Database create", () => sequelize.sync({ force: true }).then(() => sequelize.authenticate().catch(error => code = error)));
    after("Database clean", async () => await sequelize.drop());
    it("should return no error", () => expect(code).to.be.true);
    describe("Create post test", () => {
        before(async () => {
            for (let i = 0; i < 10; i++) {
                await userHandle.register("PostNameTest" + i, "PostTestPSW");
                await topicHandle.create("TopicNameTest" + i, "http://none", "This is Topic Name" + i);
            }
        });
        it("should return the creation result", async () => {
            const assets = [ 1, 2, { name: "Creation Test", preview: "http://sssss/sdssda", content: "Creation test text" } ];
            postCache = await postHandle.create(...assets);
            debug.log(postCache);
            expect(postCache).to.have.property("id").to.be.equal(1);
            expect(postCache).to.have.property("name").to.be.equal("Creation Test");
            expect(postCache).to.have.property("preview").to.be.equal("http://sssss/sdssda");
            expect(postCache).to.have.property("content").to.be.equal("Creation test text");
            expect(postCache).to.have.property("userId").to.be.equal(1);
            expect(postCache).to.have.property("topicId").to.be.equal(2);
        });
        it("should return empty when user empty", async () => {
            const assets = [ "", 2, { name: "Creation Test", preview: "http://sssss/sdssda", content: "Creation test text" } ];
            postCache = await postHandle.create(...assets);
            debug.log(postCache);
            expect(postCache).to.be.equal(state.Empty);
        });
        it("should return empty when topic empty", async () => {
            const assets = [ 1, "", { name: "Creation Test", preview: "http://sssss/sdssda", content: "Creation test text" } ];
            postCache = await postHandle.create(...assets);
            debug.log(postCache);
            expect(postCache).to.be.equal(state.Empty);
        });
        it("should return empty when name empty", async () => {
            const assets = [ 1, 2, { preview: "http://sssss/sdssda", content: "Creation test text" } ];
            postCache = await postHandle.create(...assets);
            debug.log(postCache);
            expect(postCache).to.be.equal(state.Empty);
        });
        it("should return result when preview empty", async () => {
            const assets = [ 1, 2, { name: "Creation Test", content: "Creation test text with smae name" } ];
            postCache = await postHandle.create(...assets);
            debug.log(postCache);
            expect(postCache).to.have.property("id").to.be.equal(2);
            expect(postCache).to.have.property("name").to.be.equal("Creation Test");
            expect(postCache).to.have.property("preview");
            expect(postCache).to.have.property("content").to.be.equal("Creation test text with smae name");
            expect(postCache).to.have.property("userId").to.be.equal(1);
            expect(postCache).to.have.property("topicId").to.be.equal(2);
        });
        it("should return empty when content empty", async () => {
            const assets = [ "", 2, { name: "Creation Test", preview: "http://sssss/sdssda" } ];
            postCache = await postHandle.create(...assets);
            debug.log(postCache);
            expect(postCache).to.be.equal(state.Empty);
        });
        it("should return result when create with name string", async () => {
            const assets = [ "PostNameTest3", 2, { name: "Creation Test", preview: "http://sssss/sdssda", content: "Creation test text" } ];
            postCache = await postHandle.create(...assets);
            debug.log(postCache);
            expect(postCache).to.have.property("id").to.be.equal(3);
            expect(postCache).to.have.property("name").to.be.equal("Creation Test");
            expect(postCache).to.have.property("preview").to.be.equal("http://sssss/sdssda");
            expect(postCache).to.have.property("content").to.be.equal("Creation test text");
            expect(postCache).to.have.property("userId").to.be.equal(4);
            expect(postCache).to.have.property("topicId").to.be.equal(2);
        });
        it("should return result when create with topic string", async () => {
            const assets = [ "PostNameTest3", "TopicNameTest2", { name: "Creation Test", preview: "http://sssss/sdssda", content: "Creation test text" } ];
            postCache = await postHandle.create(...assets);
            debug.log(postCache);
            expect(postCache).to.have.property("id").to.be.equal(4);
            expect(postCache).to.have.property("name").to.be.equal("Creation Test");
            expect(postCache).to.have.property("preview").to.be.equal("http://sssss/sdssda");
            expect(postCache).to.have.property("content").to.be.equal("Creation test text");
            expect(postCache).to.have.property("userId").to.be.equal(4);
            expect(postCache).to.have.property("topicId").to.be.equal(3);
        });
        it("should return result when create none exist name string", async () => {
            const assets = [ "Balabalabala", "TopicNameTest2", { name: "Creation Test", preview: "http://sssss/sdssda", content: "Creation test text" } ];
            postCache = await postHandle.create(...assets);
            debug.log(postCache);
            expect(postCache).to.be.equal(state.NotExist);
        });
    });
    describe("Get post test", () => {
        it ("should return post with id 1", async () => {
            postCache = await postHandle.getPostById(1);
            debug.log(postCache);
            expect(postCache).to.have.property("id").to.be.equal(1);
            expect(postCache).to.have.property("name").to.be.equal("Creation Test");
            expect(postCache).to.have.property("preview").to.be.equal("http://sssss/sdssda");
            expect(postCache).to.have.property("content").to.be.equal("Creation test text");
            expect(postCache).to.have.property("userId").to.be.equal(1);
            expect(postCache).to.have.property("topicId").to.be.equal(2);
        });
        it ("should return posts with name Creation Test", async () => {
            postCache = await postHandle.getPostsByName("Creation Test");
            debug.log(postCache);
            expect(postCache.length).to.be.equal(4);
        });
    });
    describe("View post test", () => {
        it("should increase post views with 1 with id 1", async () => {
            const result = await postHandle.viewPost(1);
            const fall = await postHandle.getPostById(1);
            debug.log(result, fall);
            expect(fall).to.have.property("views").to.be.equal(1);
        });
        it("should increase post views with 1 * 100 with id 2", async () => {
            new Promise((resolve, reject) => {
                for (let i = 0; i < 100; i++)
                    postHandle.viewPost(2).then();
                resolve();
            }).then(async () => {
                postCache = await postHandle.getPostById(2);
                debug.log(postCache);
                expect(postCache).to.have.property("views").to.be.equal(20);
            });
        });
        it("should return empty target", async () => {
            postCache = await postHandle.viewPost("balabalabala");
            debug.log(postCache);
            expect(postCache).to.be.equal(state.Empty);
        });
    });
    describe("Get post views test", async () => {
        it("should return post views with id 2", async () => {
            postCache = await postHandle.getPostViewsById(2);
            debug.log(postCache);
            expect(postCache).to.be.above(50);
        });
    });
    describe("Thumb post test", () => {
        it("should create thumb", async () => {
            for (let i = 1; i < 5; i++)
                await postHandle.thumbPost(i, 1);
        });
        it("should create thumb", async () => {
            let result = await postHandle.thumbPost("PostNameTest5", 1);
            debug.log(result)
        });
        it("should return error with not exist", async () => {
            await postHandle.thumbPost("Balabala", 1)
        });
    });
    describe("Get post thumbs test", async () => {
        it("should return post thumbs with id 1", async () => {
            postCache = await postHandle.getPostThumbsById(1);
            debug.log(postCache);
        });
    });
    describe("Comment post test", () => {
        it("should create comment", async () => {
            for (let i = 1; i < 5; i++)
                await postHandle.commentPost(i, 1, "2333333");
        });
        it("should not create comment with too short text", async () => {
            const result = await postHandle.commentPost(1, 1, "1");
            expect(result).to.be.equal(state.TooShort);
        });
        it("should not create comment with undefined", async () => {
            const result = await postHandle.commentPost(1, 1, undefined);
            expect(result).to.be.equal(state.Empty);
        });
    });
    describe("Get post comments test", async () => {
        it("should return post comments with id 1", async () => {
            postCache = await postHandle.getPostCommentsById(1);
            debug.log(postCache);
        });
    });
    describe("Get post rank by id", async () => {
        it("should return the rank number", async () => {
            postCache = await postHandle.getPostRankById(1);
            const result = (0.1) + 5 + (4 * 2);
            expect(postCache).to.be.equal(result);
        });
    });
    describe("Get last id test", () => {
        before(async () => code = await userHandle.getLastId());
        it("should return a integer", async () => {
            let id = await postHandle.getLastId();
            debug.log(id);
            expect(id).which.is.a("number").not.below(0);
        });
        it("should return a integer with 1 offset", async () => {
            let id = await postHandle.getLastId(1);
            debug.log(id);
            expect(id).which.is.a("number").not.below(1);
        });
    });
    describe("Get all post test", () => {
        it("should return some user instance > 1", async () => {
            postCache = await postHandle.getAllPosts()
            expect(postCache.length).to.be.above(1);
        });
        it("should return a user instance", async () => {
            postCache = await postHandle.getAllPosts(1);
            expect(postCache.length).to.be.equal(1);
        });
        it("should return error empty", async () => {
            postCache = await postHandle.getAllPosts("string");
            expect(postCache).to.be.equal(state.Empty);
        });
    });
    describe("Get all post with rank test", () => {
        it("should return some user instance with rank desc", async () => {
            postCache = await postHandle.getAllPostsByRank();
            debug.log(postCache);
        });
        it("should return 2 instance with rank desc", async () => {
            await postHandle.viewPost(2);
            postCache = await postHandle.getAllPostsByRank(2);
            debug.log(postCache);
        });
        it("should return 2 instance with rank asc", async () => {
            postCache = await postHandle.getAllPostsByRank(2, true);
            debug.log(postCache);
        });
    });
    describe("Count post", () => {
        it("should return the number of post", async () => {
            let count = await postHandle.countPost(),
                lastId = await postHandle.getLastId();
            debug.log(count, lastId)
            expect(count).to.be.equal(lastId);
        });
    });
    describe("Deprecate post test", () => {
        beforeEach(async () => code = await postHandle.countPost());
        it("should lower down 1 index", async () => {
            await postHandle.deprecateById(1);
            expect(await postHandle.countPost()).to.be.equal(code - 1);
        });
    });
    describe("Restore post test", () => {
        beforeEach(async () => code = await postHandle.countPost());
        it("should lower down 1 index", async () => {
            await postHandle.restoreById(1);
            expect(await postHandle.countPost()).to.be.equal(code + 1);
        });
    });
})
