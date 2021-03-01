const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const PasswordReset = require("../models/password-reset.model")
const User = require("../models/user.model")


async function resetRequest(email) {
    user = await User.findOne({ email: email }).catch((err) => {
        throw new Error("Email not found");
    })
    result = await PasswordReset.create(new PasswordReset({
        tokenHash: 
    }))
}

async function checkToken(token) {

}

async function resetPassword(pwd) {

}

module.exports = { resetPassword, resetRequest, checkToken }