const express = require("express");
const app = express();
const methodOverride = require("method-override");
const bodyParser = require("body-parser");
const session = require("express-session");
const Contractor = require("./models/contractors");
const Reviewer = require("./models/reviewers");
const contractorController = require("./controller/contractor");
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

// HOME ROUTE

app.get("/", (req, res) => {
    console.log(req.session)
    res.render("home.ejs")
})

// LOGIN ROUTE

app.get("/login", (req, res) => {
    res.render("login.ejs", {
        incorrectlogin: req.session.incorrectlogin
    })
})

app.post("/login", async (req, res) => {
    try{
        const foundContractor = await Contractor.findOne({email: req.body.email});
        const foundReviewer = await Reviewer.findOne({email: req.body.email});
        if(foundContractor){
            if(bcrypt.compareSync(req.body.password, foundContractor.password)){
                req.session.name = foundContractor.name;
                req.session.logged = true;
                req.session.incorrectlogin = ""
                res.redirect("/contractors")
            }
            else{
                req.session.incorrectlogin = "Username or password is incorrect."
                res.redirect("/login")
            }

        }
        else if(foundReviewer){
            if(bcrypt.compareSync(req.body.password, foundReviewer.password)){
                req.session.name = foundReviewer.name;
                req.session.logged = true;
                req.session.incorrectlogin = ""
                res.redirect("/")
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
        const foundContractor = await Contractor.findOne({email: req.body.email});
        const foundReviewer = await Reviewer.findOne({email: req.body.email});
        if(foundContractor || foundReviewer){
            req.session.duplicate = "Email already exists. Please try another.";
            res.redirect("/register");
        }
        else if(req.body.contractor === true){
            const password = req.body.password;
            const passwordHash = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
            const contractorDbEntry = {};
            contractorDbEntry.name = req.body.name;
            contractorDbEntry.email = req.body.email;
            contractorDbEntry.contractor = true;
            contractorDbEntry.password = passwordHash;
            contractorDbEntry.followerCount = 0;
            contractorDbEntry.rating = 0;
            const newContractor = await Contractor.create(contractorDbEntry);
            console.log(newContractor)
            req.session.name = newContractor.name;
            req.session.logged = true;
            req.session.duplicate = "";
            res.redirect("/contractors");
        }
        else{
            const password = req.body.password;
            const passwordHash = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
            const reviewerDbEntry = {};
            reviewerDbEntry.name = req.body.name;
            reviewerDbEntry.email = req.body.email;
            reviewerDbEntry.contractor = true;
            reviewerDbEntry.password = passwordHash;
            reviewerDbEntry.followerCount = 0;
            reviewerDbEntry.rating = 0;
            const newReviewer = await Reviewer.create(reviewerDbEntry);
            console.log(newReviewer)
            req.session.name = newReviewer.name;
            req.session.logged = true;
            req.session.duplicate = "";
            res.redirect("/");
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