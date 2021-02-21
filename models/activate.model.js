const mongoose = require("mongoose");

const activateSchema = mongoose.Schema({
    randomString: { type: String, required: true },
    userID: { type: String, required: true }

});

module.exports = mongoose.model("activate", activateSchema);
