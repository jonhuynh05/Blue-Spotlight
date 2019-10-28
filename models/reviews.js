const mongoose = require("mongoose");
const reviewSchema = new mongoose.Schema({
    rating: {type: Number, required: true},
    description: {type: String, required: true},
    authorName: String,
    subjectName: String,
    authorUsername: String,
    subjectUsername: String
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;