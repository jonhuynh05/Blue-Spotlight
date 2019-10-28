const express = require("express");
const router = express.Router();
const Contractor = require("../models/contractors");
const Reviewer = require("../models/reviewers");
const bcrypt = require("bcryptjs");

router.get("/", async (req, res) => {
    try{
        console.log(req.session)
        const foundContractor = await Contractor.findOne({username: req.session.username});
        res.render("contractors/index.ejs", {
            contractor: foundContractor
        })
    }
    catch(err){
        res.send(err)
        console.log(err)
    }
})

router.get("/:id", async (req, res) => {
    try{
        const foundContractor = await Contractor.findOne({username: req.session.username})
        res.render("contractors/show.ejs", {
            contractor: foundContractor
        })
    }
    catch(err){
        res.send(err)
        console.log(err)
    }
})


router.get("/:id/edit", async (req, res) => {
    try{
        const foundContractor = await Contractor.findOne({username: req.session.username});
        res.render("contractors/edit.ejs", {
            contractor: foundContractor,
            duplicate: req.session.duplicate
        })
    }
    catch(err){
        res.send(err)
        console.log(err)
    }
})

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
        else {
            if(bcrypt.compareSync(req.body.password, loggedInContractor.password) === false){
                if(req.body.password === ""){
                    const contractorDbEntry = {};
                    contractorDbEntry.name = req.body.name;
                    contractorDbEntry.username = req.body.username;
                    contractorDbEntry.email = req.body.email;
                    contractorDbEntry.phoneNumber = req.body.phoneNumber
                    const updatedContractor = await Contractor.findOneAndUpdate({username: req.session.username}, contractorDbEntry, {new: true});
                    req.session.username = updatedContractor.username;
                    req.session.name = updatedContractor.name;
                    req.session.duplicate = "";
                    console.log(updatedContractor)
                    console.log(req.session)
                    res.redirect("/contractors");
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
                    console.log(updatedContractor)
                    console.log(req.session)
                    res.redirect("/contractors");
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
                console.log(updatedContractor)
                console.log(req.session)
                res.redirect("/contractors");
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
        const contractorToBeDeleted = await Contractor.findOne({username: req.session.username})


        //*****MAKE SURE TO REMOVE REVIEW FROM USER*****

        const deletedContractor = await Contractor.findOneAndDelete({username: req.session.username});
        req.session.destroy();
        res.redirect("/");
    }
    catch (err) {
        res.send(err)
        console.log(err)
    }
})

module.exports = router;