const express = require("express");
const router = express.Router();
const Reviewer = require("../models/reviewers");
const bcrypt = require("bcryptjs");

router.get("/", async (req, res) => {
    try{
        console.log(req.session)
        const loggedInReviewer = await Reviewer.findOne({username: req.session.username});
        res.render("reviewers/index.ejs", {
            reviewer: loggedInReviewer
        })
    }
    catch(err){
        res.send(err);
        console.log(err);
    }
})

router.get("/:id", async (req, res) => {
    try{
        const loggedInReviewer = await Reviewer.findOne({username: req.session.username});
        res.render("reviewers/show.ejs", {
            reviewer: loggedInReviewer
        })
    }
    catch(err){
        res.send(err)
        console.log(err)
    }
})

router.get("/:id/edit", async (req, res) => {
    try{
        const loggedInReviewer = await Reviewer.findOne({username: req.session.username});
        res.render("reviewers/edit.ejs", {
            reviewer: loggedInReviewer,
            duplicate: req.session.duplicate
        })
    }
    catch(err){
        res.send(err)
        console.log(err)
    }
})

module.exports = router;