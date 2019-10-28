const express = require("express");
const router = express.Router();
const Reviewer = require("../models/reviewers");
const Contractor = require("../models/contractors");
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

router.put("/:id",  async (req, res) =>{
    try{
        const loggedInReviewer = await Reviewer.findOne({username: req.session.username});
        const foundReviewerUsername = await Reviewer.findOne({username: req.body.username});
        const foundReviewerEmail = await Reviewer.findOne({email: req.body.email});
        const foundContractorUsername = await Contractor.findOne({username: req.body.username});
        const foundContractorEmail = await Contractor.findOne({email: req.body.email});
        if(loggedInReviewer.username !== req.body.username && (foundReviewerUsername || foundContractorUsername)){
            req.session.duplicate = "Username already exists. Please try another.";
            res.redirect("/reviewers/:id/edit");
        }
        else if(loggedInReviewer.email !== req.body.email && (foundReviewerEmail || foundContractorEmail)){
            req.session.duplicate = "Email already exists. Please try another.";
            res.redirect("/reviewers/:id/edit");
        }
        else {
            if(bcrypt.compareSync(req.body.password, loggedInReviewer.password) === false){
                if(req.body.password === ""){
                    const reviewerDbEntry = {};
                    reviewerDbEntry.name = req.body.name;
                    reviewerDbEntry.username = req.body.username;
                    reviewerDbEntry.email = req.body.email;
                    const updatedReviewer = await Reviewer.findOneAndUpdate({username: req.session.username}, reviewerDbEntry, {new: true});
                    req.session.username = updatedReviewer.username;
                    req.session.name = updatedReviewer.name;
                    req.session.duplicate = "";
                    console.log(updatedReviewer)
                    console.log(req.session)
                    res.redirect("/reviewers");
                }
                else{
                    const newPassword = req.body.password;
                    const passwordHash = bcrypt.hashSync(newPassword, bcrypt.genSaltSync(10));
                    const reviewerDbEntry = {};
                    reviewerDbEntry.name = req.body.name;
                    reviewerDbEntry.username = req.body.username;
                    reviewerDbEntry.email = req.body.email;
                    reviewerDbEntry.password = passwordHash;
                    const updatedReviewer = await Reviewer.findOneAndUpdate({username: req.session.username}, reviewerDbEntry, {new: true});
                    req.session.username = updatedReviewer.username;
                    req.session.name = updatedReviewer.name;
                    req.session.duplicate = "";
                    console.log(updatedReviewer)
                    console.log(req.session)
                    res.redirect("/reviewers");
                }
            }
            else{
                const reviewerDbEntry = {};
                reviewerDbEntry.name = req.body.name;
                reviewerDbEntry.username = req.body.username;
                reviewerDbEntry.email = req.body.email;
                const updatedReviewer = await Reviewer.findOneAndUpdate({username: req.session.username}, updatedReviewer, {new: true});
                req.session.username = updatedReviewer.username;
                req.session.name = updatedReviewer.name;
                req.session.duplicate = "";
                console.log(updatedReviewer)
                console.log(req.session)
                res.redirect("/reviewers");
            }
        }
    }
    catch (err) {
        res.send(err)
        console.log(err)
    }
})

router.delete("/:id", async (req, res) => {
    try{
        const reviewerToBeDeleted = await Reviewer.findOne({username: req.session.username});

        //*****MAKE SURE TO REMOVE REVIEW FROM CONTRACTOR*****

        const deletedReviewer = await Reviewer.findOneAndDelete({username: req.session.username});
        req.session.destroy();
        res.redirect("/");
    }
    catch(err) {
        res.send(err)
        console.log(err)
    }
})

module.exports = router;