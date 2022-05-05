const express = require("express");

const state = require("../config/state.js");
const searchHandle = require("../handle/search.js");
const tokenHandle = require("../handle/token.js");

const router = express.Router();

router.get("/:keyword", async (req, res) => {
    console.log(req.params)
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
    const posts = await searchHandle.searchPostsByTag(req.params.tag, 6);
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

module.exports = router;
