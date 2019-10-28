const express = require("express");
const router = express.Router();
const Review = require("../models/reviews");
const Contractor = require("../models/contractors");
const Reviewer = require("../models/reviewers");

router.get("/", async (req, res) => {
    try{
        const allContractors = await Contractor.find({});
        res.render("reviews/index.ejs", {
            contractors: allContractors,
            selfReviewMsg: req.session.selfReviewMsg
        });
    }
    catch(err){
        res.send(err);
        console.log(err);
    }
})

router.get("/:id", async (req, res) => {
    try{
        const searchedContractor = await Contractor.findById(req.params.id);
        const contractorReviews = [];
        for(let i = 0; i < searchedContractor.reviews.length; i++){
            let foundReview = await Review.findById(searchedContractor.reviews[i]);
            console.log(foundReview)
            contractorReviews.push(foundReview);
            console.log(contractorReviews)
        }
        console.log(contractorReviews)
        res.render("reviews/contractorReviews.ejs", {
            contractor: searchedContractor,
            foundReviews: contractorReviews
        })
    }
    catch(err){
        res.send(err);
        console.log(err);
    }
})

router.get("/:id/writereview", async (req, res) => {
    try{
        const searchedContractor = await Contractor.findById(req.params.id);
        res.render("reviews/writeReview.ejs", {
            contractor: searchedContractor
        })
    }
    catch(err){
        res.send(err);
        console.log(err);
    }
})

router.post("/:id", async (req, res) => {
    try{
        const loggedContractor = await Contractor.findOne({username: req.session.username});
        const loggedReviewer = await Reviewer.findOne({username: req.session.username});
        const reviewedContractor = await Contractor.findById(req.params.id);
        const newReview = await Review.create(req.body)
        if(loggedContractor && loggedContractor.username === reviewedContractor.username){
            req.session.selfReviewMsg = "You can't write a review about yourself."
            res.redirect("/reviews");
        }
        else if(loggedContractor && loggedContractor.username !== reviewedContractor.username){
            req.session.selfReviewMsg = "";
            loggedContractor.writtenReviews.push(newReview);
            await loggedContractor.save();
            reviewedContractor.reviews.push(newReview);
            await reviewedContractor.save();
            res.redirect("/reviews/:id");
        }
        else{
            req.session.selfReviewMsg = "";
            loggedReviewer.writtenReviews.push(newReview)
            await loggedReviewer.save();
            reviewedContractor.reviews.push(newReview);
            await reviewedContractor.save();
            res.redirect("/reviews/:id");
        }
    }
    catch(err){
        res.send(err);
        console.log(err);
    }
})

module.exports = router;