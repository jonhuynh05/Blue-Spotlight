const mongoose = require("mongoose");
const reviewSchema = new mongoose.Schema({
    rating: {type: Number, required: true},
    description: {type: String, required: true},
    authorName: String,
    authorUsername: String,
    authorId: String,
    subjectName: String,
    subjectUsername: String,
    subjectId: String,
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;