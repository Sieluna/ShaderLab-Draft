const express = require("express");
const router = express.Router();

router.get("/editor", (req, res, next) => {
    res.render("editor", { title: "Shader Lab Editor" });
});

module.exports = router;