const postHandle = require("../handle/post.js");
const tagHandle = require("../handle/tag.js");
const state = require("../config/state.js");
const sequelize = require("../handle/model.js");
const expect = require("chai").expect;

describe("Post handle test", () => {
    before("Database create", async () => sequelize.sync({ force: true }));
    after("Database clean", async () => sequelize.drop());
    before(async () => require("../config/inject.js")());
    describe("Create post test", () => {
        it("should return the creation result", async () => {
            const assets = [ 1, 2, { name: "Creation Test", preview: "http://sssss/sdssda", content: "Creation test text" } ];
            const post = await postHandle.create(...assets);
            expect(post).to.have.property("id").to.be.equal(11)
            expect(post).to.have.property("name").to.be.equal("Creation Test");
            expect(post).to.have.property("preview").to.be.equal("http://sssss/sdssda");
            expect(post).to.have.property("content").to.be.equal("Creation test text");
            expect(post).to.have.property("userId").to.be.equal(1);
            expect(post).to.have.property("topicId").to.be.equal(2);
        });
        it("should return empty when user empty", async () => {
            const assets = [ "", 2, { name: "Creation Test", preview: "http://sssss/sdssda", content: "Creation test text" } ];
            const code = await postHandle.create(...assets);
            expect(code).to.be.equal(state.Empty);
        });
        it("should return empty when topic empty", async () => {
            const assets = [ 1, "", { name: "Creation Test", preview: "http://sssss/sdssda", content: "Creation test text" } ];
            const code = await postHandle.create(...assets);
            expect(code).to.be.equal(state.Empty);
        });
        it("should return empty when name empty", async () => {
            const assets = [ 1, 2, { preview: "http://sssss/sdssda", content: "Creation test text" } ];
            const code = await postHandle.create(...assets);
            expect(code).to.be.equal(state.Empty);
        });
        it("should return result when preview empty", async () => {
            const assets = [ 1, 2, { name: "Creation Test", content: "Creation test text with smae name" } ];
            const post = await postHandle.create(...assets);
            expect(post).to.have.property("id").to.be.equal(12);
            expect(post).to.have.property("name").to.be.equal("Creation Test");
            expect(post).to.have.property("preview").to.be.undefined;
            expect(post).to.have.property("content").to.be.equal("Creation test text with smae name");
            expect(post).to.have.property("userId").to.be.equal(1);
            expect(post).to.have.property("topicId").to.be.equal(2);
        });
        it("should return empty when content empty", async () => {
            const assets = [ "", 2, { name: "Creation Test", preview: "http://sssss/sdssda" } ];
            const code = await postHandle.create(...assets);
            expect(code).to.be.equal(state.Empty);
        });
        it("should return result when create with name string", async () => {
            const assets = [ "DefaultUser3", 2, { name: "Creation Test", preview: "http://sssss/sdssda", content: "Creation test text" } ];
            const post = await postHandle.create(...assets);
            expect(post).to.have.property("id").to.be.equal(13);
            expect(post).to.have.property("name").to.be.equal("Creation Test");
            expect(post).to.have.property("preview").to.be.equal("http://sssss/sdssda");
            expect(post).to.have.property("content").to.be.equal("Creation test text");
            expect(post).to.have.property("userId").to.be.equal(3);
            expect(post).to.have.property("topicId").to.be.equal(2);
        });
        it("should return result when create with topic string", async () => {
            const assets = [ "DefaultUser3", "TopicNameInject", { name: "Creation Test", preview: "http://sssss/sdssda", content: "Creation test text" } ];
            const post = await postHandle.create(...assets);
            expect(post).to.have.property("id").to.be.equal(14);
            expect(post).to.have.property("name").to.be.equal("Creation Test");
            expect(post).to.have.property("preview").to.be.equal("http://sssss/sdssda");
            expect(post).to.have.property("content").to.be.equal("Creation test text");
            expect(post).to.have.property("userId").to.be.equal(3);
            expect(post).to.have.property("topicId").to.be.equal(11);
        });
        it("should return result when create none exist name string", async () => {
            const assets = [ "Balabalabala", "TopicNameInject", { name: "Creation Test", preview: "http://sssss/sdssda", content: "Creation test text" } ];
            const code = await postHandle.create(...assets);
            expect(code).to.be.equal(state.NotExist);
        });
    });
    describe("Get post test", () => {
        it ("should return post with id 11", async () => {
            const post = await postHandle.getPostById(11);
            expect(post).to.have.property("id").to.be.equal(11);
            expect(post).to.have.property("name").to.be.equal("Creation Test");
            expect(post).to.have.property("preview").to.be.equal("http://sssss/sdssda");
            expect(post).to.have.property("content").to.be.equal("Creation test text");
            expect(post).to.have.property("userId").to.be.equal(1);
            expect(post).to.have.property("topicId").to.be.equal(2);
        });
        it ("should return posts with name Creation Test", async () => {
            const posts = await postHandle.getPostsByName("Creation Test");
            expect(posts).which.is.a("array").to.be.lengthOf(4);
        });
    });
    describe("View post test", () => {
        it("should increase post views with 1 with id 1", async () => {
            const result = await postHandle.viewPost(1);
            const post = await postHandle.getPostById(1);
            expect(post).to.have.property("views").to.be.equal(1);
        });
        it("should increase post views with 1 * 100 with id 2", async () => {
            let taskList = [];
            for (let i = 0; i < 100; i++) taskList.push(postHandle.viewPost(2));
            await Promise.all(taskList);
            const post = await postHandle.getPostById(2);
            expect(post).to.have.property("views").to.be.equal(100);
        });
    });
    describe("Get post views test", async () => {
        it("should return post views with id 2", async () => {
            const post = await postHandle.getPostViewsById(2);
            expect(post).to.be.equal(100);
        });
    });
    describe("Thumb post test", () => {
        it("should create thumb", async () => {
            for (let i = 1; i < 5; i++) await postHandle.thumbPost(i, 1);
            const thumbs = await postHandle.getPostThumbsById(1);
            expect(thumbs).to.be.equal(4);
        });
        it("should return error with not exist ", async () => {
            const thumb = await postHandle.thumbPost("DefaultUser2", 1);
            expect(thumb[0]).to.have.property("userId").to.be.equal(2);
            expect(thumb[1]).to.be.false;
        });
        it("should return error with not exist", async () => {
            const code = await postHandle.thumbPost("Balabala", 1);
            expect(code).to.be.equal(state.NotExist);
        });
    });
    describe("Get post thumbs test", async () => {
        it("should return post thumbs with id 1", async () => {
            const thumbs = await postHandle.getPostThumbsById(1);
            expect(thumbs).to.be.equal(4);
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
            const comments = await postHandle.getPostCommentsById(1);
            expect(comments).to.be.equal(4);
        });
    });
    describe("Tag post test", () => {
        it("should tag the post", async () => {
            let taskList = [
                postHandle.tagPost("day", 1), postHandle.tagPost("dya", 1),
                postHandle.tagPost("ayd", 1), postHandle.tagPost("ady", 1),
                postHandle.tagPost("yda", 1), postHandle.tagPost("yad", 1),
            ];
            await Promise.all(taskList);
            const result = await tagHandle.getAllTags();
            expect(result).to.be.lengthOf(10 + 6);
        });
    });
    describe("Get post rank by id", async () => {
        it("should return the rank number", async () => {
            const post = await postHandle.getPostRankById(2);
            expect(post).to.be.equal(10);
        });
    });
    describe("Get last id test", () => {
        it("should return a integer", async () => {
            let id = await postHandle.getLastId();
            expect(id).which.is.a("number").to.be.equal(10 + 4);
        });
        it("should return a integer with 1 offset", async () => {
            let id = await postHandle.getLastId(1);
            expect(id).which.is.a("number").to.be.equal(10 + 4 + 1);
        });
    });
    describe("Get all post test", () => {
        it("should return some user instance > 1", async () => {
            const posts = await postHandle.getAllPosts();
            expect(posts).which.is.a("array").to.be.lengthOf(10 + 4);
        });
        it("should return a user instance", async () => {
            const posts = await postHandle.getAllPosts(1);
            expect(posts).which.is.a("array").to.be.lengthOf(1);
        });
        it("should return error empty", async () => {
            const posts = await postHandle.getAllPosts("string");
            expect(posts).to.be.equal(state.Empty);
        });
    });
    describe("Get all post with rank test", () => {
        it("should return some post instance with rank desc", async () => {
            const posts = await postHandle.getAllPostsByRank();
            expect(posts).which.is.a("array").to.have.lengthOf(14);
            expect(posts[0]).to.have.property("id").to.be.equal(1);
            expect(posts[1]).to.have.property("id").to.be.equal(2);
        });
        it("should return 1 post instance with rank desc", async () => {
            const posts = await postHandle.getAllPostsByRank(1);
            expect(posts).which.is.a("array").to.have.lengthOf(1);
            expect(posts[0]).to.have.property("id").to.be.equal(1);
        });
        it("should return 2 instance with rank desc", async () => {
            await postHandle.viewPost(2);
            const posts = await postHandle.getAllPostsByRank(2);
            expect(posts).which.is.a("array").to.be.lengthOf(2);
        });
        it("should return 2 instance with rank asc", async () => {
            const posts = await postHandle.getAllPostsByRank(2, "ASC");
            expect(posts).which.is.a("array").to.be.lengthOf(2);
        });
    });
    describe("Count post", () => {
        it("should return the number of post", async () => {
            let count = postHandle.countPost(),
                lastId = postHandle.getLastId();
            expect(await count).to.be.equal(await lastId);
        });
    });
    describe("Deprecate post test", () => {
        it("should lower down 1 index", async () => {
            const before = await postHandle.countPost();
            const effect = await postHandle.deprecateById(1);
            expect(effect).to.be.equal(1);
            expect(await postHandle.countPost()).to.be.equal(before - 1);
        });
    });
    describe("Restore post test", () => {
        it("should increase 1 index", async () => {
            const before =  await postHandle.countPost();
            const result = await postHandle.restoreById(1);
            expect(result).to.be.equal(1);
            expect(await postHandle.countPost()).to.be.equal(before + 1);
        });
        it("should return empty with none number params", async () => {
            const code = await postHandle.restoreById("string");
            expect(code).to.be.equal(state.Empty);
        });
        it("should return not exist with 9999 params", async () => {
            const before =  await postHandle.countPost();
            const result = await postHandle.restoreById(9999);
            expect(result).to.be.equal(state.NotExist);
            expect(await postHandle.countPost()).to.be.equal(before);
        });
    });
});
