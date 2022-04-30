const express = require("express");
const path = require("path");

const state = require("../config/state.js");
const topicHandle = require("../handle/topic.js");
const tokenHandle = require("../handle/token.js");
const userHandle = require("../handle/user");

const router = express.Router();

router.get("/", tokenHandle.verify, async (req, res) => {
    const topic = await topicHandle.getAllTopics();
    res.status(200).json(topic);
});

router.get("/:id", tokenHandle.verify, async (req, res) => {
    const user = await topicHandle.getTopicById(req.params.id);
    switch (user) {
        case state.NotExist:
            res.status(404).send("Topic not found");
            break;
        case state.Empty:
            req.status(400).send("Not valid id, should be ")
        default:
            res.status(200).json(user);
            break;
    }
});

router.post("/login", async (req, res) => {
    const user = await userHandle.login(req.body.account, req.body.password);
    switch (user) {
        case state.OverSize:
            res.status(400).send("Not valid account or password");
            break;
        case state.NotCorrect:
            res.status(400).send("Password incorrect!");
            break;
        case state.NotExist:
            res.status(400).send("Account not exist!");
            break;
        case state.Empty:
            res.status(400).send("Account or password can not be empty.");
            break;
        default:
            res.status(200).json({ data: user, token: tokenHandle.sign(user.id, user.permission) });
            break;
    }
});

router.post("/", async (req, res) => {
    const user = await userHandle.register(req.body.account, req.body.password);
    switch (user) {
        case state.Duplicate:
            res.status(400).send("Account already exist");
            break;
        case state.OverSize:
            res.status(400).send("Account or password is too long");
            break;
        case state.Empty:
            res.status(400).send("Account or password can not be empty.");
            break;
        default:
            res.status(200).json({ data: user, token: tokenHandle.sign(user.id, user.permission) });
            break;
    }
});

router.put("/:id", tokenHandle.verify, async (req, res) => {
    if (req.body.id === req.params.id) {
        const user = await userHandle.updateById(id, req.body);
    } else {
        return res.status(400).send(`Bad request: param ID (${id}) does not match body ID (${req.body.id}).`)
    }
});

router.delete("/:id", tokenHandle.verify, async (req, res) => {
    const effect = await userHandle.deprecateById(req.params.id);
    switch (effect) {
        case state.NotExist:
            res.status(404).send("User could not find");
            break;
        case state.Empty:
            res.status(404).send("Params not exist");
            break;
        default:
            res.status(200).end();
            break;
    }
});

module.exports = router;
