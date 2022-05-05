const userHandle = require("../handle/user.js");
const topicHandle = require("../handle/topic.js");
const postHandle = require("../handle/post.js");

module.exports = async () => {
    for (let i = 1; i < 10; i++) {
        await userHandle.register(`DefaultUser${i}`, "DefaultUserPassword");
        await topicHandle.create(`DefaultTopic${i}`, "/img/default.png", `This is Default Topic Name ${i}`);
        await postHandle.create(i, i, {name: `DefaultPost${i}`, content: "Some random info"});
        await postHandle.tagPost("helloworld", i);
    }
}

