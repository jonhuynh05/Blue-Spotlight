const express = require("express");
const router = express.Router();
const Review = require("../models/reviews");
const Contractor = require("../models/contractors");
const Reviewer = require("../models/reviewers");
const isLoggedIn = (req, res, next) => {
    if(req.session.logged === true){
        req.session.mustlogin = ""
        next()
    }
    else{
        req.session.mustlogin = "Please log in to access content."
        res.redirect("/login")
    }
}

router.get("/", isLoggedIn, async (req, res) => {
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

router.get("/contractors/:id", isLoggedIn, async (req, res) => {
    try{
        const searchedContractor = await Contractor.findById(req.params.id);
        const contractorReviews = [];
        const ratingArr = [];
        for(let i = 0; i < searchedContractor.reviews.length; i++){
            let foundReview = await Review.findById(searchedContractor.reviews[i]);
            ratingArr.push(foundReview.rating);
            contractorReviews.push(foundReview);
        }
        const avgRating = ratingArr.reduce( function (a, b) {
            return a + b
        }, 0)/ratingArr.length;
        searchedContractor.rating = avgRating;
        await searchedContractor.save();
        res.render("reviews/contractorReviews.ejs", {
            contractor: searchedContractor,
            foundReviews: contractorReviews,
        })
    }
    catch(err){
        res.send(err);
        console.log(err);
    }
})

router.get("/reviewers/:id", isLoggedIn, async (req, res) => {
    try{
        const reviewerContractor = await Contractor.findById(req.params.id).populate({path: "writtenReviews"});
        const reviewerReviewer = await Reviewer.findById(req.params.id).populate({path: "writtenReviews"});
        if(reviewerContractor){
            res.render("reviews/reviewer.ejs", {
                reviewer: reviewerContractor
            })
        }
        else{
            res.render("reviews/reviewer.ejs", {
                reviewer: reviewerReviewer
            }) 
        }
    }
    catch(err){
        res.send(err);
        console.log(err);
    }
})

router.get("/contractors/:id/writereview", isLoggedIn, async (req, res) => {
    try{
        const searchedContractor = await Contractor.findById(req.params.id);
        const loggedContractor = await Contractor.findOne({username: req.session.username});
        const loggedReviewer = await Reviewer.findOne({username: req.session.username});
        if(loggedContractor){
            res.render("reviews/writeReview.ejs", {
                contractor: searchedContractor,
                reviewer: loggedContractor
            })
        }
        else{
            res.render("reviews/writeReview.ejs", {
                contractor: searchedContractor,
                reviewer: loggedReviewer
            })
        }
    }
    catch(err){
        res.send(err);
        console.log(err);
    }
})

router.get("/", (req, res) => {
    try{
        req.session.destroy();
        res.redirect("/")
    }
    catch(err){
        res.send(err);
        console.log(err)
    }
})

router.post("/contractors/:id", async (req, res) => {
    try{
        console.log(req.body)
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
            res.redirect("/reviews/contractors/" + reviewedContractor._id);
            console.log(newReview)
        }
        else{
            req.session.selfReviewMsg = "";
            loggedReviewer.writtenReviews.push(newReview)
            await loggedReviewer.save();
            reviewedContractor.reviews.push(newReview);
            await reviewedContractor.save();
            res.redirect("/reviews/contractors/" + reviewedContractor._id);
            console.log(newReview)

        }
    }
    catch(err){
        res.send(err);
        console.log(err);
    }
})


module.exports = router;