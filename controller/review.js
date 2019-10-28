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

router.get("/contractors/:id", async (req, res) => {
    try{
        const searchedContractor = await Contractor.findById(req.params.id);
        const contractorReviews = [];
        const ratingArr = [];
        const authors = [];
        for(let i = 0; i < searchedContractor.reviews.length; i++){
            let foundReview = await Review.findById(searchedContractor.reviews[i]);
            console.log(foundReview+"***THIS IS THE REVIEW***")
            let foundAuthor = await Reviewer.findOne({username: foundReview.authorUsername});
            console.log(foundAuthor+"<<<<THIS IS THE AUTHOR>>>>")
            ratingArr.push(foundReview.rating);
            authors.push(foundAuthor);
            contractorReviews.push(foundReview);
        }
        // console.log(authors+"<<<<<")
        const avgRating = ratingArr.reduce( function (a, b) {
            return a + b
        }, 0)/ratingArr.length;
        searchedContractor.rating = avgRating;
        await searchedContractor.save();
        res.render("reviews/contractorReviews.ejs", {
            contractor: searchedContractor,
            foundReviews: contractorReviews,
            reviewer: authors
        })
    }
    catch(err){
        res.send(err);
        console.log(err);
    }
})

router.get("/contractors/:id/writereview", async (req, res) => {
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