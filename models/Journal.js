const mongoose = require("mongoose");
const User = require("./User");

const journalSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User
    },
    date: {
        type: String,
        default: () => new Date().toISOString().split("T")[0]
    }
})

const Journal = mongoose.model("Journal", journalSchema);
module.exports = Journal;