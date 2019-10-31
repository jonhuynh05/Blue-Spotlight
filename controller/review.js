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

const roundToTwoDecimalPlaces = (num) => {    
    return +(Math.round(num + "e+2")  + "e-2");
}

router.get("/", isLoggedIn, async (req, res) => {
    try{
        req.session.selfReviewMsg = ""
        const allContractors = await Contractor.find({});
        const contractor = await Contractor.findOne({username: req.session.username});
        const reviewer = await Reviewer.findOne({username: req.session.username});
        res.render("reviews/index.ejs", {
            accountType: req.session.type,
            contractors: allContractors,
            reviewer: reviewer,
            contractor: contractor
        });
    }
    catch(err){
        res.send(err);
        console.log(err);
    }
})

router.get("/contractors/:id", isLoggedIn, async (req, res) => {
    try{
        const contractor = await Contractor.findOne({username: req.session.username});
        const reviewer = await Reviewer.findOne({username: req.session.username});
        const searchedContractor = await Contractor.findById(req.params.id);
        const contractorReviews = [];
        const ratingArr = [];
        for(let i = 0; i < searchedContractor.reviews.length; i++){
            let foundReview = await Review.findById(searchedContractor.reviews[i]);
            ratingArr.push(foundReview.rating);
            contractorReviews.push(foundReview);
        }
        if(searchedContractor.rating === 0 && searchedContractor.reviews.length === 0){
            searchedContractor.rating = 0
            await searchedContractor.save();
        }
        else{
            const avgRating = ratingArr.reduce( function (a, b) {
                return a + b
            }, 0)/ratingArr.length;
            searchedContractor.rating = roundToTwoDecimalPlaces(avgRating);
            await searchedContractor.save();
        }
        res.render("reviews/contractorReviews.ejs", {
            accountType: req.session.type,
            searchedContractor: searchedContractor,
            foundReviews: contractorReviews,
            contractor: contractor,
            reviewer: reviewer
        })
    }
    catch(err){
        res.send(err);
        console.log(err);
    }
})

router.get("/reviewers/:id", isLoggedIn, async (req, res) => {
    try{
        const contractor = await Contractor.findOne({username: req.session.username});
        const reviewer = await Reviewer.findOne({username: req.session.username});
        const reviewerContractor = await Contractor.findById(req.params.id).populate({path: "writtenReviews"});
        const reviewerReviewer = await Reviewer.findById(req.params.id).populate({path: "writtenReviews"});
        if(reviewerContractor){
            res.render("reviews/reviewer.ejs", {
                accountType: req.session.type,
                reviewerReviewer: reviewerContractor,
                contractor: contractor,
                reviewer: reviewer
            })
        }
        else{
            res.render("reviews/reviewer.ejs", {
                accountType: req.session.type,
                reviewerReviewer: reviewerReviewer,
                contractor: contractor,
                reviewer: reviewer
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
        const contractor = await Contractor.findOne({username: req.session.username});
        const reviewer = await Reviewer.findOne({username: req.session.username});
        const searchedContractor = await Contractor.findById(req.params.id);
        const loggedContractor = await Contractor.findOne({username: req.session.username});
        const loggedReviewer = await Reviewer.findOne({username: req.session.username});
        if(loggedContractor){
            res.render("reviews/writeReview.ejs", {
                accountType: req.session.type,
                searchedContractor: searchedContractor,
                loggedReviewer: loggedContractor,
                contractor: contractor,
                reviewer: reviewer,
                selfReviewMsg: req.session.selfReviewMsg
            })
        }
        else{
            res.render("reviews/writeReview.ejs", {
                accountType: req.session.type,
                searchedContractor: searchedContractor,
                loggedReviewer: loggedReviewer,
                contractor: contractor,
                reviewer: reviewer,
                selfReviewMsg: req.session.selfReviewMsg
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
        const loggedContractor = await Contractor.findOne({username: req.session.username});
        const loggedReviewer = await Reviewer.findOne({username: req.session.username});
        const reviewedContractor = await Contractor.findById(req.params.id);
        const foundExistingReview = await Review.findOne({subjectId: req.params.id, authorUsername: req.session.username})
        if(loggedContractor && loggedContractor.username === reviewedContractor.username){
            req.session.selfReviewMsg = `Unable to submit. Please remember you can't write a review about yourself, ${loggedContractor.name}.`
            res.redirect("/reviews/contractors/"+req.params.id+"/writereview");
        }
        else if(foundExistingReview){
            req.session.selfReviewMsg = `Unable to submit. Please note you have already written a review about ${reviewedContractor.name}.`
            res.end()
            res.redirect("/reviews/contractors/"+req.params.id+"/writereview");
        }
        else if(loggedContractor && loggedContractor.username !== reviewedContractor.username){
            const newReview = await Review.create(req.body)
            req.session.selfReviewMsg = "";
            loggedContractor.writtenReviews.push(newReview);
            await loggedContractor.save();
            reviewedContractor.reviews.push(newReview);
            await reviewedContractor.save();
            res.redirect("/reviews/contractors/" + reviewedContractor._id);
            console.log(newReview)
        }
        else{
            const newReview = await Review.create(req.body)
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