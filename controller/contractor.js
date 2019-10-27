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

// router.put("/", async (req, res) => {
//     try{
//         const foundContractorEmail = await Contractor.findOne({email: req.body.email});
//         const foundContractorUsername = await Contractor.findOne({email: req.body.username});
//         if(foundContractorUsername){
//             req.session.duplicate = "Username already exists. Please try another.";
//             res.redirect("/contractors/edit");
//         }
//         else if(foundContractorEmail){
//             req.session.duplicate = "Email already exists. Please try another.";
//             res.redirect("/contractors/edit");
//         }
//         else {
//             const password = req.body.password;
//             const passwordHash = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
//             const contractorDbEntry = {};
//             contractorDbEntry.name = req.body.name;
//             contractorDbEntry.username = req.body.username;
//             contractorDbEntry.email = req.body.email;
//             contractorDbEntry.password = passwordHash;
//             contractorDbEntry.phoneNumber = req.body.phoneNumber
//             const updatedContractor = await Contractor.findOneAndUpdate({username: req.session.username}, contractorDbEntry, {new: true});
//             req.session.username = updatedContractor.username;
//             req.session.name = updatedContractor.name;
//             req.session.duplicate = "";
//             console.log(updatedContractor)
//             console.log(req.session)
//             res.redirect("/contractors");
//         }
//     }
//     catch (err) {
//         res.send(err)
//         console.log(err)
//     }
// })

module.exports = router;