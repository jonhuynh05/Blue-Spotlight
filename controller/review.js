const express = require("express");
const router = express.Router();
const Review = require("../models/reviews");
const Contractor = require("../models/contractors");
const Reviewers = require("../models/reviewers");

router.get("/", (req, res) => {
    try{
        res.render("reviews/index.ejs")
    }
    catch(err){
        res.send(err);
        console.log(err);
    }
})


module.exports = router;