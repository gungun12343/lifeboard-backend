const mongoose = require("mongoose");

const habitSchema = new mongoose.Schema({
    name: String,
    history: [{
        date: String,
        completed: Boolean,
    }],
    streak: {
        type: Number,
        default: 0
    }
})

const Habit = mongoose.model("Habit", habitSchema);
module.exports = Habit;