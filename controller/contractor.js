const express = require("express");
const router = express.Router();
const Contractor = require("../models/contractors")

router.get("/", (req, res) => {
    res.render("contractors/index.ejs", {
        contractor: Contractor
    })
})

module.exports = router;