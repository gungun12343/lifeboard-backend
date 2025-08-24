const mongoose = require("mongoose");
const User = require("./User");

const todoSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User
    },
    todo: {
        type: String,
        required: true,
    },
    isDone: {
        type: Boolean,
        default: false,
    }
})

const Todo = mongoose.model("Todo", todoSchema);
module.exports = Todo;