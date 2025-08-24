const mongoose = require("mongoose");
const User = require("./User");

const habitSchema = new mongoose.Schema({
    name: String,
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User,
    },
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