const express = require("express");
const router = express.Router();
const Reviewer = require("../models/reviewers");
const Contractor = require("../models/contractors");
const Review = require("../models/reviews");
const bcrypt = require("bcryptjs");
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

//REVIEWER INDEX

router.get("/", isLoggedIn, async (req, res) => {
    try{
        const loggedInReviewer = await Reviewer.findOne({username: req.session.username});
        res.render("reviewers/index.ejs", {
            accountType: req.session.type,
            reviewer: loggedInReviewer
        })
    }
    catch(err){
        res.send(err);
        console.log(err);
    }
})

//REVIEWER SHOW PAGE

router.get("/:id", isLoggedIn, async (req, res) => {
    try{
        const loggedInReviewer = await Reviewer.findOne({username: req.session.username});
        res.render("reviewers/show.ejs", {
            accountType: req.session.type,
            reviewer: loggedInReviewer
        })
    }
    catch(err){
        res.send(err)
        console.log(err)
    }
})

//REVIEWER SUBMITTED REVIEWS

router.get("/:id/written-reviews", isLoggedIn, async (req, res) => {
    try{
        const loggedInReviewer = await Reviewer.findOne({username: req.session.username});
        const reviewsArr = [];
        const reviewSubjectArr = [];
        for (let i = 0; i < loggedInReviewer.writtenReviews.length; i++){
            let foundReview = await Review.findById(loggedInReviewer.writtenReviews[i]);
            reviewsArr.push(foundReview);
            let reviewSubject = await Contractor.findOne({username: reviewsArr[i].subjectUsername});
            reviewSubjectArr.push(reviewSubject)
        }

        res.render("reviewers/writtenReviews.ejs", {
            accountType: req.session.type,
            reviewer: loggedInReviewer,
            foundReviews: reviewsArr,
            reviewSubject: reviewSubjectArr
        })
    }
    catch(err){
        res.send(err)
        console.log(err)
    }
})

//REVIEWER EDIT REVIEWS

router.get("/:id/written-reviews/edit/:revid", isLoggedIn, async (req, res) => {
    try{
        const loggedInReviewer = await Reviewer.findOne({username: req.session.username});
        const foundReview = await Review.findById(req.params.revid);
        res.render("reviewers/editReview.ejs", {
            accountType: req.session.type,
            reviewer: loggedInReviewer,
            review: foundReview
        })
    }
    catch(err){
        res.send(err)
        console.log(err)
    }
})

//REVIEWER EDIT PROFILE

router.get("/:id/edit", isLoggedIn, async (req, res) => {
    try{
        const loggedInReviewer = await Reviewer.findOne({username: req.session.username});
        res.render("reviewers/edit.ejs", {
            accountType: req.session.type,
            reviewer: loggedInReviewer,
            duplicate: req.session.duplicate
        })
    }
    catch(err){
        res.send(err)
        console.log(err)
    }
})

//LOGOUT

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

//REVIEWER EDIT REVIEW PUT ROUTE

router.put("/:id/written-reviews/edit/:revid", async (req, res) => {
    try{
        const updatedReview = await Review.findByIdAndUpdate(req.params.revid,req.body, {new: true});
        res.redirect("/reviewers/"+req.params.id+"/written-reviews")
    }
    catch(err){
        res.send(err)
        console.log(err)
    }
})

//REVIEWER DELETE REVIEW

router.delete("/:id/written-reviews/edit/:revid", async (req, res) => {
    try{
        const reviewToBeDeleted = await Review.findById(req.params.revid);
        const reviewAuthor = await Reviewer.findOne({username: req.session.username});
        const reviewSubject = await Contractor.findOne({username: reviewToBeDeleted.subjectUsername})

        reviewAuthor.writtenReviews.remove(req.params.revid)
        await reviewAuthor.save()
        reviewSubject.reviews.remove(req.params.revid)
        await reviewSubject.save()
        const deletedReview = await Review.findByIdAndDelete(req.params.revid)

        res.redirect("/reviewers/"+req.params.id+"/written-reviews");
    }
    catch(err) {
        res.send(err)
        console.log(err)
    }
})

//REVIEWER EDIT PROFILE PUT ROUTE

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
        else if(req.body.name === "" || req.body.username === "" || req.body.email === ""){
            req.session.duplicate = "Please ensure name, username, and email are filled out.";
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
                    res.redirect("/reviewers/"+req.params.id);
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
                    res.redirect("/reviewers/"+req.params.id);
                }
            }
            else{
                const reviewerDbEntry = {};
                reviewerDbEntry.name = req.body.name;
                reviewerDbEntry.username = req.body.username;
                reviewerDbEntry.email = req.body.email;
                const updatedReviewer = await Reviewer.findOneAndUpdate({username: req.session.username}, reviewerDbEntry, {new: true});
                req.session.username = updatedReviewer.username;
                req.session.name = updatedReviewer.name;
                req.session.duplicate = "";
                res.redirect("/reviewers/"+req.params.id);
            }
        }
    }
    catch (err) {
        res.send(err)
        console.log(err)
    }
})

//REVIEWER DELETE PROFILE

router.delete("/:id", async (req, res) => {
    try{
        const reviewerToBeDeleted = await Reviewer.findOne({username: req.session.username});

        for (let i = 0; i < reviewerToBeDeleted.writtenReviews.length; i++){
            await Review.findByIdAndDelete(reviewerToBeDeleted.writtenReviews[i]);
            let foundContractor = await Contractor.findOne({reviews: reviewerToBeDeleted.writtenReviews[i]});
            foundContractor.reviews.remove(reviewerToBeDeleted.writtenReviews[i]);
            await foundContractor.save()
        }

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