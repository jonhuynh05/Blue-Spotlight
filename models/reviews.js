const mongoose = require("mongoose");
const reviewSchema = new mongoose.Schema({
    rating: {type: Number, required: true},
    description: {type: String, required: true},
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;