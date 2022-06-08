const express = require("express");
const path = require("node:path");
const fs = require("node:fs");
const multer = require("multer");

const upload = multer({
    fileFilter: (req, file, callback) => {
        const acceptableMime = [".webp", ".jpeg", ".png", ".jpg", ".gif"];
        callback(null, acceptableMime.includes(path.extname(file.originalname)));
    },
    storage: multer.diskStorage({
        destination: path.resolve(__dirname, "../static/data/topic"), // upload target
        filename: function (req, file, callback) {
            let extName = path.extname(file.originalname);
            topicHandle.getLastId(1).then(fileName => {
                fs.stat(path.resolve(__dirname, "../static/data/topic/", fileName + extName), (err, stat) => {
                    if (err == null)
                        fs.unlink(path.resolve(__dirname, "../static/data/topic/", fileName + extName), () => callback(null, fileName + extName));
                    else if (err.code === "ENOENT")
                        callback(null, fileName + extName);
                });
            });
        }
    })
});

const state = require("../config/state.js");
const topicHandle = require("../handle/topic.js");
const tokenHandle = require("../handle/token.js");

const router = express.Router();

router.get("/", async (req, res) => {
    const topic = await topicHandle.getAllTopics();
    res.status(200).json(topic);
});

router.get("/:topic", tokenHandle.verify(), async (req, res) => {
    const topic = await topicHandle.getTopic(req.params.topic);
    switch (topic) {
        case state.NotExist:
            res.status(404).send("Topic not found");
            break;
        case state.Empty:
            req.status(400).send("Not valid params id");
            break;
        default:
            res.status(200).json(topic);
            break;
    }
});

router.post("/", tokenHandle.verify(), upload.single("icon"), async (req, res) => {
    let { name, description } = req.body, topic;
    if (description !== undefined) {
        const url = path.relative(path.resolve(__dirname, "../"), req.file.path).replaceAll("\\", "/");
        topic = await topicHandle.create(name, url, description);
    } else
        topic = await topicHandle.createByName(name);
    switch (topic) {
        case state.OverSize:
            res.status(400).send("Topic name or description is oversize");
            break;
        case state.NotCorrect:
            res.status(400).send("Topic name not correct");
            break;
        case state.Empty:
            res.status(400).send("Not valid name");
            break;
        default:
            res.status(200).json(topic);
            break;
    }
});

router.put("/image/:id", tokenHandle.verify(), upload.single("icon"), async (req, res) => {
    const url = path.relative(path.resolve(__dirname, "../"), req.file.path).replaceAll("\\", "/");
    const topic = await topicHandle.updateImageById(req.params.id, url);
    switch (topic) {
        case state.Empty:
            res.status(400).send("Not valid id");
            break;
        default:
            res.status(200).json(topic);
            break;
    }
});

router.put("/description/:id", tokenHandle.verify(), async (req, res) => {
    const topic = await topicHandle.updateDescriptionById(req.params.id, req.body.description);
    switch (topic) {
        case state.Empty:
            res.status(400).send("Not valid id");
            break;
        default:
            res.status(200).json(topic);
            break;
    }
});

module.exports = router;
