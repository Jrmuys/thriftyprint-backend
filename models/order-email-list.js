const mongoose = require("mongoose");

const orderEmailListSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
});

module.exports = mongoose.model("OrderEmailList", orderEmailListSchema);
