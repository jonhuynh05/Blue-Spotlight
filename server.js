const express = require("express");
const app = express();
const methodOverride = require("method-override");
const bodyParser = require("body-parser");
const session = require("express-session");
const Contractor = require("./models/contractors");
const Reviewer = require("./models/reviewers");
const contractorController = require("./controller/contractor");
const reviewerController = require("./controller/reviewer");
const reviewController = require("./controller/review");
const bcrypt = require("bcryptjs");
const PORT = 5000;
require("./db/db")



app.use(express.static("public"));
app.use(session({
    secret: "random string",
    resave: false,
    saveUninitialized: false
}))
app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({extended: true}));

app.use("/contractors", contractorController);
app.use("/reviewers", reviewerController);
app.use("/reviews", reviewController);

// HOME ROUTE

app.get("/", (req, res) => {
    console.log(req.session)
    res.render("home.ejs")
})

// LOGIN ROUTE

app.get("/login", (req, res) => {
    res.render("login.ejs", {
        incorrectlogin: req.session.incorrectlogin,
        mustlogin: req.session.mustlogin
    })
})

app.post("/login", async (req, res) => {
    try{
        const foundContractor = await Contractor.findOne({username: req.body.username});
        const foundReviewer = await Reviewer.findOne({username: req.body.username});
        if(foundContractor){
            if(bcrypt.compareSync(req.body.password, foundContractor.password)){
                req.session.username = foundContractor.username;
                req.session.type = "contractor";
                req.session.logged = true;
                req.session.incorrectlogin = ""
                req.session.mustlogin = ""
                res.redirect("/contractors")
            }
            else{
                req.session.incorrectlogin = "Username or password is incorrect."
                res.redirect("/login")
            }
        }
        else if(foundReviewer){
            if(bcrypt.compareSync(req.body.password, foundReviewer.password)){
                req.session.username = foundReviewer.username;
                req.session.type = "reviewer";
                req.session.logged = true;
                req.session.incorrectlogin = ""
                req.session.mustlogin = ""
                res.redirect("/reviewers")
            }
            else{
                req.session.incorrectlogin = "Username or password is incorrect."
                res.redirect("/login")
            }
        }
        else{
            req.session.incorrectlogin = "Username or password is incorrect."
            res.redirect("/login")
        }
    }
    catch(err){
        res.send(err)
        console.log(err)
    }
})

// REGISTER ROUTE

app.get("/register", (req, res) => {
    res.render("registration.ejs", {
        duplicate: req.session.duplicate
    })
})

app.post("/register", async (req, res) => {
    try{
        const foundContractorEmail = await Contractor.findOne({email: req.body.email});
        const foundReviewerEmail = await Reviewer.findOne({email: req.body.email});
        const foundContractorUsername = await Contractor.findOne({username: req.body.username});
        const foundReviewerUsername = await Reviewer.findOne({username: req.body.username});
        if(foundContractorEmail || foundReviewerEmail){
            req.session.duplicate = "Email already exists. Please try another.";
            res.redirect("/register");
        }
        else if(foundContractorUsername || foundReviewerUsername){
            req.session.duplicate = "Username already exists. Please try another.";
            res.redirect("/register");
        }
        else if(req.body.name === "" || req.body.username === "" || req.body.email === "" || req.body.password === ""){
            req.session.duplicate = "Please fill the form out completely.";
            res.redirect("/register");
        }
        else if(req.body.contractor ==="yes"){
            const password = req.body.password;
            const passwordHash = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
            const contractorDbEntry = {};
            contractorDbEntry.username = req.body.username;
            contractorDbEntry.name = req.body.name;
            contractorDbEntry.email = req.body.email;
            contractorDbEntry.contractor = true;
            contractorDbEntry.password = passwordHash;
            contractorDbEntry.profileURL = "";
            contractorDbEntry.followerCount = 0;
            contractorDbEntry.rating = 0;
            const newContractor = await Contractor.create(contractorDbEntry);
            req.session.userId = newContractor._id;
            req.session.username = newContractor.username;
            req.session.type = "contractor";
            req.session.logged = true;
            req.session.duplicate = "";
            req.session.mustlogin = ""
            console.log(newContractor)
            console.log(req.session)
            res.redirect("/contractors");
        }
        else{
            const password = req.body.password;
            const passwordHash = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
            const reviewerDbEntry = {};
            reviewerDbEntry.username = req.body.username;
            reviewerDbEntry.name = req.body.name;
            reviewerDbEntry.email = req.body.email;
            reviewerDbEntry.contractor = false;
            reviewerDbEntry.password = passwordHash;
            reviewerDbEntry.reviewCount = 0;
            const newReviewer = await Reviewer.create(reviewerDbEntry);
            console.log(newReviewer)
            req.session.username = newReviewer.username;
            req.session.type = "reviewer";
            req.session.logged = true;
            req.session.duplicate = "";
            req.session.mustlogin = ""
            res.redirect("/reviewers");
        }
    }
    catch (err) {
        res.send(err)
        console.log(err)
    }
})


app.listen(PORT, ()=> {
    console.log(`Listening on ${PORT}.`)
});