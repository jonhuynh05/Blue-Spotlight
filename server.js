const express = require("express");
const app = express();
const methodOverride = require("method-override");
const bodyParser = require("body-parser");
const session = require("express-session");
const Contractor = require("./models/contractors");
const Reviewer = require("./models/reviewers");
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

// HOME ROUTE

app.get("/", (req, res) => {
    res.render("home.ejs")
})

// LOGIN ROUTE

app.get("/login", (req, res) => {
    res.render("login.ejs")
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
            const passwordHash = 
            Contractor.create(req.body);
            req.session.username = req.body.username;

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