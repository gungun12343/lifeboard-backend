const mongoose = require("mongoose");

const journalSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
    },
    date: {
        type: String,
        default: () => new Date().toISOString().split("T")[0]
    }
})

const Journal = mongoose.model("Journal", journalSchema);
module.exports = Journal;