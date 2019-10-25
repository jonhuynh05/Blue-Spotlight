const mongoose = require("mongoose");
const reviewSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    reviewCount: Number
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;