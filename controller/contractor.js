const express = require("express");
const router = express.Router();
const Contractor = require("../models/contractors")

router.get("/", async (req, res) => {
    try{
        res.render("contractors/index.ejs", {
            contractor: Contractor
        })
    }
    catch(err){
        res.send(err)
        console.log(err)
    }
})

module.exports = router;