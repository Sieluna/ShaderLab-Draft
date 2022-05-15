const express = require("express");
const path = require("path");
const fs = require("fs");

const state = require("../config/state.js");
const tagHandle = require("../handle/tag.js");

const router = express.Router();

router.get("/", async (req, res) => {
    const tag = await tagHandle.getGroupTags(10);
    res.status(200).json(tag);
});

module.exports = router;
