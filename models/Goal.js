const mongoose = require("mongoose");
const User = require("./User");

const goalSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User
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