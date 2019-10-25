const express = require("express");
const app = express();
const methodOverride = require("method-override");
const bodyParser = require("body-parser");
const session = require("express-session");
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


app.listen(PORT, ()=> {
    console.log(`Listening on ${PORT}.`)
});