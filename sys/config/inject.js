const debug = require("debug")("shaderlab:server");
const { user, post, tag } = require("../handle/model.js").models;
const userHandle = require("../handle/user.js");
const topicHandle = require("../handle/topic.js");

const devMode = process.env.NODE_ENV != "production";

const range = (from, to) => {
    let rand = from + (Math.random() * (to - from));
    return Math.round(rand);
}

module.exports = async (options = { max: 10, root: false}) => {
    debug("node mode %s", devMode ? "development" : "production");
    if (devMode) {
        const userList = [], topicList = [], postList = [], tagList =[];
        for (let i = 1; i <= 10; i++)
            topicList.push({ name: `DefaultTopic${i}`, image: "/img/inject/topic/default.webp", description: `This is Default Topic Name ${i}` });
        for (let i = 1; i <= options.max; i++) {
            userList.push({ name: `DefaultUser${i}`, avatar: `/img/inject/user/${range(0, 9)}.webp`, password: "DefaultUserPassword" });
            postList.push({ name: `DefaultPost${i}`, preview: "/img/inject/home/default.webp", content: "Some random info", userId: i, topicId: range(1, 10) });
            tagList.push({ name: `HelloWorld${range(1, 10)}`, postId: i });
        }
        await topicHandle.createAll(topicList);
        await user.bulkCreate(userList);
        await post.bulkCreate(postList);
        await tag.bulkCreate(tagList);
    }
    if (options.root) {
        const user = await userHandle.register("root", "root");
        await userHandle.updateAvatarById(user.id, `/img/inject/user/${range(0, 9)}.webp`);
    }
    debug("simulate data injected");
}
