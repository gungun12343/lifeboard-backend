const mongoose = require("mongoose");

const goalSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    target: {
        type: Number,
        required: true,
        min: 1,
    },
    done: {
        type: Number,
        default: 0
    }
})

const Goal = mongoose.model("Goal", goalSchema);
module.exports = Goal;