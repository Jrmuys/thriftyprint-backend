const mongoose = require("mongoose");

const passwordResetSchema = mongoose.Schema({
    tokenHash: { type: String, required: true },
    userID: { type: String, required: true },
    expireDate: { type: Date, required: true },
    createdDate: { type: Date, default: Date.now() }

});

module.exports = mongoose.model("PasswordReset", passwordResetSchema);
