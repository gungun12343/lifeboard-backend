const mongoose = require("mongoose");
const User = require("./User");

const moodSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User
    },
    mood: {
        type: String,
        required: true,
    },
})

const Mood = mongoose.model("Mood", moodSchema);
module.exports = Mood;