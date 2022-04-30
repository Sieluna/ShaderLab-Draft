const express = require("express");
const router = express.Router();

router.get("/home", (req, res, next) => {
    res.render("home", { title: "Shader Lab" });
});

module.exports = router;