const mongoose = require("mongoose");
const contractorSchema = new mongoose.Schema({
    username: {type: String, required: true, unique: true},
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    phoneNumber: Number,
    contractor: Boolean,
    followerCount: Number,
    rating: Number,
    profileURL: String,
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review"
    }],
    writtenReviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review"
    }],
});

const Contractor = mongoose.model("Contractor", contractorSchema);

module.exports = Contractor;