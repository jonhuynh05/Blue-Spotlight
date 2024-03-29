const express = require("express");
const router = express.Router();
const Contractor = require("../models/contractors");
const Reviewer = require("../models/reviewers");
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

//CONTRACTOR INDEX

router.get("/", isLoggedIn, async (req, res) => {
    try{
        console.log(req.session)
        const foundContractor = await Contractor.findOne({username: req.session.username});
        res.render("contractors/index.ejs", {
            accountType: req.session.type,
            contractor: foundContractor
        })
    }
    catch(err){
        res.send(err)
        console.log(err)
    }
})

//CONTRACTOR SHOW PAGE

router.get("/:id", isLoggedIn, async (req, res) => {
    try{
        const foundContractor = await Contractor.findOne({username: req.session.username});
        res.render("contractors/show.ejs", {
            accountType: req.session.type,
            contractor: foundContractor
        })
    }
    catch(err){
        res.send(err)
        console.log(err)
    }
})

//CONTRACTOR SUBMITTED REVIEWS

router.get("/:id/written-reviews", isLoggedIn, async (req, res) => {
    try{
        const loggedInContractor = await Contractor.findOne({username: req.session.username});
        const reviewsArr = [];
        const reviewSubjectArr = []
        for (let i = 0; i < loggedInContractor.writtenReviews.length; i++){
            let foundReview = await Review.findById(loggedInContractor.writtenReviews[i]);
            reviewsArr.push(foundReview);
            let reviewSubject = await Contractor.findOne({username: reviewsArr[i].subjectUsername});
            reviewSubjectArr.push(reviewSubject)
        }

        res.render("contractors/writtenReviews.ejs", {
            accountType: req.session.type,
            contractor: loggedInContractor,
            foundReviews: reviewsArr,
            reviewSubject: reviewSubjectArr
        })
    }
    catch(err){
        res.send(err)
        console.log(err)
    }
})

//CONTRACTOR EDIT PROFILE

router.get("/:id/edit", isLoggedIn, async (req, res) => {
    try{
        const foundContractor = await Contractor.findOne({username: req.session.username});
        res.render("contractors/edit.ejs", {
            accountType: req.session.type,
            contractor: foundContractor,
            duplicate: req.session.duplicate
        })
    }
    catch(err){
        res.send(err)
        console.log(err)
    }
})

//CONTRACTOR EDIT REVIEW

router.get("/:id/written-reviews/edit/:revid", isLoggedIn, async (req, res) => {
    try{
        const loggedInContractor = await Contractor.findOne({username: req.session.username});
        const foundReview = await Review.findById(req.params.revid);
        res.render("contractors/editReview.ejs", {
            accountType: req.session.type,
            contractor: loggedInContractor,
            review: foundReview
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

//CONTRACTOR EDIT REVIEW PUT ROUTE

router.put("/:id/written-reviews/edit/:revid", async (req, res) => {
    try{
        const updatedReview = await Review.findByIdAndUpdate(req.params.revid,req.body, {new: true});
        res.redirect("/contractors/"+req.params.id+"/written-reviews")
    }
    catch(err){
        res.send(err)
        console.log(err)
    }
})

//CONTRACTOR EDIT PROFILE PUT ROUTE

router.put("/:id", async (req, res) => {
    try{
        const loggedInContractor = await Contractor.findOne({username: req.session.username});
        const foundContractorUsername = await Contractor.findOne({username: req.body.username});
        const foundContractorEmail = await Contractor.findOne({email: req.body.email});
        const foundReviewerUsername = await Reviewer.findOne({username: req.body.username});
        const foundReviewerEmail = await Reviewer.findOne({email: req.body.email});
        if(loggedInContractor.username !== req.body.username && (foundContractorUsername || foundReviewerUsername)){
            req.session.duplicate = "Username already exists. Please try another.";
            res.redirect("/contractors/:id/edit");
        }
        else if(loggedInContractor.email !== req.body.email && (foundContractorEmail || foundReviewerEmail)){
            req.session.duplicate = "Email already exists. Please try another.";
            res.redirect("/contractors/:id/edit");
        }
        else if(req.body.name === "" || req.body.username === "" || req.body.email === ""){
            req.session.duplicate = "Please ensure name, username, and email are filled out.";
            res.redirect("/contractors/:id/edit");
        }
        else {
            if(bcrypt.compareSync(req.body.password, loggedInContractor.password) === false){
                if(req.body.password === ""){
                    const contractorDbEntry = {};
                    contractorDbEntry.name = req.body.name;
                    contractorDbEntry.username = req.body.username;
                    contractorDbEntry.email = req.body.email;
                    contractorDbEntry.phoneNumber = req.body.phoneNumber;
                    contractorDbEntry.profileURL = req.body.profileURL;
                    const updatedContractor = await Contractor.findOneAndUpdate({username: req.session.username}, contractorDbEntry, {new: true});
                    req.session.username = updatedContractor.username;
                    req.session.name = updatedContractor.name;
                    req.session.duplicate = "";
                    res.redirect("/contractors/"+req.params.id);
                }
                else{
                    const newPassword = req.body.password;
                    const passwordHash = bcrypt.hashSync(newPassword, bcrypt.genSaltSync(10));
                    const contractorDbEntry = {};
                    contractorDbEntry.name = req.body.name;
                    contractorDbEntry.username = req.body.username;
                    contractorDbEntry.email = req.body.email;
                    contractorDbEntry.password = passwordHash;
                    contractorDbEntry.phoneNumber = req.body.phoneNumber
                    const updatedContractor = await Contractor.findOneAndUpdate({username: req.session.username}, contractorDbEntry, {new: true});
                    req.session.username = updatedContractor.username;
                    req.session.name = updatedContractor.name;
                    req.session.duplicate = "";
                    res.redirect("/contractors/"+req.params.id);
                }
            }
            else{
                const contractorDbEntry = {};
                contractorDbEntry.name = req.body.name;
                contractorDbEntry.username = req.body.username;
                contractorDbEntry.email = req.body.email;
                contractorDbEntry.phoneNumber = req.body.phoneNumber
                const updatedContractor = await Contractor.findOneAndUpdate({username: req.session.username}, contractorDbEntry, {new: true});
                req.session.username = updatedContractor.username;
                req.session.name = updatedContractor.name;
                req.session.duplicate = "";
                res.redirect("/contractors/"+req.params.id);
            }
        }
    }
    catch (err) {
        res.send(err)
        console.log(err)
    }
})

//DELETE PROFILE

router.delete("/:id", async (req, res) => {
    try{
        const contractorToBeDeleted = await Contractor.findOne({username: req.session.username})
        for (let i = 0; i < contractorToBeDeleted.reviews.length; i++){
            await Review.findByIdAndDelete(contractorToBeDeleted.reviews[i]);
            let foundContractor = await Contractor.findOne({writtenReviews: contractorToBeDeleted.reviews[i]});
            if(foundContractor){
                foundContractor.writtenReviews.remove(contractorToBeDeleted.reviews[i]);
                await foundContractor.save()
            }
            let foundReviewer = await Reviewer.findOne({writtenReviews: contractorToBeDeleted.reviews[i]});
            if(foundReviewer){
                foundReviewer.writtenReviews.remove(contractorToBeDeleted.reviews[i]);
                await foundReviewer.save()
            }
        }
        for (let i = 0; i < contractorToBeDeleted.writtenReviews.length; i++){
            await Review.findByIdAndDelete(contractorToBeDeleted.writtenReviews[i])
            let foundContractor = await Contractor.findOne({reviews: contractorToBeDeleted.writtenReviews[i]});
            foundContractor.reviews.remove(contractorToBeDeleted.writtenReviews[i]);
            foundContractor.save()
        }
        const deletedContractor = await Contractor.findOneAndDelete({username: req.session.username});
        req.session.destroy();
        res.redirect("/");
    }
    catch (err) {
        res.send(err)
        console.log(err)
    }
})

//DELETE REVIEW

router.delete("/:id/written-reviews/edit/:revid", async (req, res) => {
    try{
        const reviewToBeDeleted = await Review.findById(req.params.revid);
        const reviewAuthor = await Contractor.findOne({username: req.session.username});
        const reviewSubject = await Contractor.findOne({username: reviewToBeDeleted.subjectUsername})

        reviewAuthor.writtenReviews.remove(req.params.revid)
        await reviewAuthor.save()
        reviewSubject.reviews.remove(req.params.revid)
        await reviewSubject.save()
        const deletedReview = await Review.findByIdAndDelete(req.params.revid)

        res.redirect("/contractors/"+req.params.id+"/written-reviews");
    }
    catch(err) {
        res.send(err)
        console.log(err)
    }
})

module.exports = router;