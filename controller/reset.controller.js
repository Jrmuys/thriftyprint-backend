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
    console.log("Email address: " + emailAddress)
    user = await User.findOne({ email: emailAddress }).catch((err) => {
        throw new Error("Email not found");
    })
    console.log("Reset Request received...")
    if (user) {
        console.log("User found", user)
        token = Crypto.randomBytes(50).toString('hex').slice(0, 128).replace('/', '6')
        // token = "test"
        console.log("token: " + token)
        today = new Date()
        console.log("Date: " + today)

        expireDate = new Date(today.getTime() + 15 * 60000)
        console.log("Expire date: " + expireDate)

        tokenHash = bcrypt.hashSync(token, 10)
        result = await PasswordReset.create(new PasswordReset({
            tokenHash: tokenHash,
            userID: user._id,
            expireDate: expireDate,
        })).catch(err => {
            console.log("Error in creating new password", err)
            throw err
        })
        if (result) {
            console.log("Sending email")
            email.resetEmail(user, token)
        } else {
            throw new Error("Could not create new PasswordReset")
        }
    } else {
        console.log("Email not found")
        throw new Error("Email not found")
    }
}

/**
 * Checks if token is valid
 * @param {String} token 
 * @returns {Promise<PasswordReset | null>}  returns PasswordReset object if found, otherwise returns null
 */
async function checkToken(token) {
    console.log("Checking token...")
    tokenHash = bcrypt.hashSync(token, 10)
    results = await PasswordReset.find({}).catch((err) => {
        console.log("Error in finding PasswordReset", err)
        throw err
    })
    if (results) {
        for (var i = 0; i < results.length; i++) {
            console.log(results[i].expireDate < Date.now())
            if (results[i].expireDate < Date.now()) {
                console.log("Deleting results[i]: " + results[i])
                PasswordReset.deleteOne({ _id: results[i]._id }).then((result) => {
                    console.log("Successfully deleted: ", result)
                }).catch((err) => {
                    console.log('Error deleting: ', err)
                })
            } else if (bcrypt.compareSync(token, results[i].tokenHash)) {
                console.log("FOUND TOKEN RESPONSE")
                console.log("Results[i]: " + results[i] + "\n")
                console.log(results[i].expireDate > Date.now())

                if (results[i].expireDate > Date.now()) {
                    console.log("Returning results[i]")

                    return results[i];
                }
                else {
                    throw new Error("Token expired")
                }
            }
        }
        console.log("Token not found")
        throw new Error("Token not found")


    } else {
        throw new Error("Invalid token")
    }
}

/**
 * Resets the user's password to pwd
 * @param {String} pwd 
 * @param {PasswordReset} passwordReset 
 */
async function resetPassword(pwd, passwordResetObj) {
    let passwordHash = bcrypt.hashSync(pwd, 10)
    let userID = passwordResetObj.userID
    console.log("User ID: " + userID)
    console.log(passwordResetObj)
    test = await User.findOne({ _id: userID })
    console.log(test)
    user = await User.findOneAndUpdate({ _id: userID }, { hashedPassword: passwordHash }).catch((err) => {
        console.log("Error in updating user from ID in resetPassword", err)
        throw err
    })
    console.log(user)
    if (user) {
        user.toObject();
        PasswordReset.findOneAndDelete({ _id: passwordResetObj._id }).then(value => {
            console.log("Successfully deleted passwordObject for password reset", value)
        }).catch(err => {
            console.error(err)
        })
        email.passwordChangeEmail(user)
        return 1;
    } else {
        throw new Error("(PasswordReset) Could not find user from ID and update")
    }
}

module.exports = { resetPassword, resetRequest, checkToken }