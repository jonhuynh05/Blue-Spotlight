const express = require("express");
const router = express.Router();
const Contractor = require("../models/contractors")

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

module.exports = router;