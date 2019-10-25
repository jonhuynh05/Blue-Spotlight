const mongoose = require("mongoose");
const reviewerSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    reviewCount: Number,
    contractor: Boolean,
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review"
    }]
});

const Reviewer = mongoose.model("Reviewer", reviewerSchema);

module.exports = Reviewer;