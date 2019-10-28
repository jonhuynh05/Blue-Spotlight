const express = require("express");
const router = express.Router();
const Review = require("../models/reviews");
const Contractor = require("../models/contractors");
const Reviewers = require("../models/reviewers");

router.get("/", async (req, res) => {
    try{
        const allContractors = await Contractor.find({});
        res.render("reviews/index.ejs", {
            contractors: allContractors
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
        res.render("reviews/contractor-reviews.ejs", {
            contractor: searchedContractor
        })
    }
    catch(err){
        res.send(err);
        console.log(err);
    }
})

module.exports = router;