const express = require("express");
const router = express.Router();
const Reviewer = require("../models/reviewers");
const bcrypt = require("bcryptjs");

router.get("/", (req, res) => {
    try{
        const loggedInReviewer = Reviewer.findOne({username: req.session.username});
        res.render("reviewers/index.ejs", {
            reviewer: loggedInReviewer
        })
    }
    catch(err){
        res.send(err);
        console.log(err);
    }
})

module.exports = router;