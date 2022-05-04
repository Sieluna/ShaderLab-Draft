const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const upload = multer({
    fileFilter: (req, file, callback) => {
        const acceptableMime = [".webp", ".jpeg", ".png", ".jpg", ".gif"];
        if (acceptableMime.includes(path.extname(file.originalname)))
            callback(null, true);
        else
            callback(null, false);
    },
    storage: multer.diskStorage({
        destination: path.resolve(__dirname, "../static/data/post"), // upload target
        filename: function (req, file, callback) {
            let extName = path.extname(file.originalname);
            postHandle.getLastId(1).then(fileName => {
                fs.stat(path.resolve(__dirname, "../static/data/post/", fileName + extName), (err, stat) => {
                    if (err == null)
                        fs.unlink(path.resolve(__dirname, "../static/data/post/", fileName + extName), () => callback(null, fileName + extName));
                    else if (err.code === "ENOENT")
                        callback(null, fileName + extName);
                });
            });
        }
    })
});

const tokenHandle = require("../handle/token.js");
const postHandle = require("../handle/post.js");
const state = require("../config/state");

const router = express.Router();

router.get("/", tokenHandle.verify, async (req, res) => {
    const posts = await postHandle.getAllPosts(50);
    res.status(200).json(posts);
});

router.get("/:id", tokenHandle.verify, async (req, res) => {
    const post = await postHandle.getViewPostById(req.params.id);
    switch (post) {
        case state.NotExist:
            res.status(404).send("Post not found");
            break;
        case state.Empty:
            res.status(400).send("Param is empty");
            break;
        default:
            res.status(200).json(post);
            break;
    }
});

router.post("/", tokenHandle.verify, upload.single("preview"), async (req, res) => {
    const url = path.relative(path.resolve(__dirname, "../"), req.file.path).replaceAll("\\", "/");
    const post = await postHandle.create(req.auth.id, req.body.topic, { name: req.body.name, preview: url, content: req.body.content });
    console.log(post);
    switch (post) {
        case state.NotExist:
            res.status(404).send("Error user action when create topic");
            break;
        case state.Empty:
            res.status(400).send("Post missing info, please check our submission.");
            break;
        default:
            res.status(200).json(post);
            break;
    }
});

module.exports = router;
