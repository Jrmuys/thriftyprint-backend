/**
 * Defines the reset controller
 * @module controller/reset
 * @description Handles resetting the password along with generating, storing, and checking password reset tokens
 */


const bcrypt = require("bcryptjs");
const Crypto = require("crypto");
const PasswordReset = require("../models/password-reset.model")
const User = require("../models/user.model")
const email = require("./email.controller")

/**
 * Request password reset for an email
 * @param {String} emailAddress 
 */
async function resetRequest(emailAddress) {
    user = await User.findOne({ email: emailAddress }).catch((err) => {
        throw new Error("Email not found");
    })
    if (user) {
        token = Crypto.randomBytes(128).toString('base64').slice(0, size)


        expireDate = new Date()
        expireDate.setDate(new Date(today).getDate() + 1)
        tokenHash = bcrypt.hashSync(token, 10)
        result = await PasswordReset.create(new PasswordReset({
            tokenHash: tokenHash,
            userID: user._id,
            expireDate: expireDate
        })).catch(err => {
            console.log("Error in creating new password", err)
            throw err
        })
        if (result) {
            email.resetEmail(user, token)
        } else {
            throw new Error("Could not create new PasswordReset")
        }
    } else {
        throw new Error("Email not found")
    }
}

/**
 * Checks if token is valid
 * @param {String} token 
 * @returns {Promise<PasswordReset | null>}  returns PasswordReset object if found, otherwise returns null
 */
async function checkToken(token) {
    tokenHash = bcrypt.hashSync(token, 10)
    result = await PasswordReset.findOne({ token: tokenHash }).catch((err) => {
        console.log("Error in finding PasswordReset", err)
        throw err
    })
    if (result) {
        if (result.expireDate < Date.now())
            return result
        else {
            throw new Error("Token expired")
        }
    } else {
        throw new Error("Invalid token")
    }
}

/**
 * Resets the user's password to pwd
 * @param {String} pwd 
 * @param {PasswordReset} passwordReset 
 */
async function resetPassword(pwd, passwordReset) {
    passwordHash = bcrypt.hashSync(pwd, 10)
    user = await User.findOneAndUpdate({ _id: passwordReset.userID }, { hashedPassword: passwordHash }).catch((err) => {
        console.log("Error in updating user from ID in resetPassword", err)
        throw err
    })
    if (user) {
        user.toObject();
        email.passwordChangeEmail(user)
        return 1;
    } else {
        throw new Error("(PasswordReset) Could not find user from ID and update")
    }
}

module.exports = { resetPassword, resetRequest, checkToken }