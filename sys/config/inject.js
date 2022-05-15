const userHandle = require("../handle/user.js");
const topicHandle = require("../handle/topic.js");
const postHandle = require("../handle/post.js");

const range = (from, to) => {
    let rand = from + (Math.random() * (to - from));
    return Math.round(rand);
}

module.exports = async (max = 10) => {
    for (let i = 1; i <= 10; i++) {
        await topicHandle.create(`DefaultTopic${i}`, "/img/inject/topic/default.png", `This is Default Topic Name ${i}`);
    }
    for (let i = 1; i <= max; i++) {
        await userHandle.register(`DefaultUser${i}`, "DefaultUserPassword");
        await userHandle.updateAvatarById(i, `/img/inject/user/${range(0, 9)}.png`);
        await postHandle.create(i, range(1, 10), {name: `DefaultPost${i}`, preview: "/img/inject/home/default.png", content: "Some random info"});
        await postHandle.tagPost(`HelloWorld${range(1, 10)}`, i);
    }
}
