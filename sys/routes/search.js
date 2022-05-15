const express = require("express");

const state = require("../config/state.js");
const searchHandle = require("../handle/search.js");

const router = express.Router();

router.get("/:keyword", async (req, res) => {
    const posts = await searchHandle.SearchPostsByContent(req.params.keyword, 50);
    switch (posts) {
        case state.NotExist:
            res.status(200).send("");
            break;
        case state.Empty:
            req.status(400).send("Not valid params keyword");
            break;
        default:
            res.status(200).json(posts);
            break;
    }
});

router.get("/user/:name", async (req, res) => {
    const users = await searchHandle.searchUserByName(req.params.name, 6);
    switch (users) {
        case state.NotExist:
            res.status(200).send("");
            break;
        case state.Empty:
            req.status(400).send("Not valid params name");
            break;
        default:
            res.status(200).json(users);
            break;
    }
});

router.get("/post/:name", async (req, res) => {
    const posts = await searchHandle.searchPostsByName(req.params.name, 6);
    switch (posts) {
        case state.NotExist:
            res.status(200).send("");
            break;
        case state.Empty:
            req.status(400).send("Not valid params name");
            break;
        default:
            res.status(200).json(posts);
            break;
    }
});

router.get("/tag/:tag", async (req, res) => {
    const posts = await searchHandle.searchPostsByTag(req.params.tag, 50);
    switch (posts) {
        case state.NotExist:
            res.status(200).send("");
            break;
        case state.Empty:
            req.status(400).send("Not valid params tag");
            break;
        default:
            res.status(200).json(posts);
            break;
    }
});

router.get("/topic/:topic", async (req, res) => {
    const posts = await searchHandle.searchPostsByTopic(req.params.topic, 50);
    switch (posts) {
        case state.NotExist:
            res.status(200).send("");
            break;
        case state.Empty:
            req.status(400).send("Not valid params topic");
            break;
        default:
            res.status(200).json(posts);
            break;
    }
});

module.exports = router;
