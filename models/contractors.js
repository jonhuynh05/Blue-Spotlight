const mongoose = require("mongoose");
const contractorSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    phoneNumber: {type: Number, unique: true},
    contractor: Boolean,
    followerCount: Number,
    rating: Number,
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review"
    }]
});

const Contractor = mongoose.model("Contractor", contractorSchema);

module.exports = Contractor;