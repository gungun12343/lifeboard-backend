const mongoose = require("mongoose");

const moodSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
    },
    mood: {
        type: String,
        required: true,
    },
})

const Mood = mongoose.model("Mood", moodSchema);
module.exports = Mood;