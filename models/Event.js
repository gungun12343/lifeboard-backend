const mongoose = require("mongoose");
const User = require("./User");

const eventSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User
    },
    date: {
        type: Date,
        required: true
    }
})

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;