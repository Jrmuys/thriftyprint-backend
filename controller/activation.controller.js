/**
 * Defines activation controller to handle email verification and account activation
 * @module controller/activation
 */

const Crypto = require('crypto')
const Activate = require("../models/activate.model")
const email = require("./email.controller")
const User = require('../models/user.model')
const SuperStr = require('@supercharge/strings')

/**
 * Creates an activation link and sends calls the email module to send a verification email
 * @param {User} user 
 */
async function createActivation(user) {
    randomString = randomString()
    console.log("random string = ", randomString)
    newActivate = { randomString: randomString, userID: user._id }
    await new Activate(newActivate).save().catch((error) => {
        console.log("Error saving new Activation details", error.code)
        throw error
    });
    console.log("Successfully saved activation details")
    console.log("Sending email...")
    email.sendVerification(user.fullname, user.email, randomString);


}

/**
 * Generates a random string of 128 random digits (not including "/" characters)
 * @returns {String} Randomly generated string of 128 digits
 */
function randomString() {
    return SuperStr.random(128);
}

/**
 * Activates an account based on the random string passed into it
 * @param {String} rndString Random string passed through http request
 * @returns {Number} If successful, returns "1," else throws an error
 */
async function activateAccount(rndString) {
    console.log("Activating account...")
    let activateFound = await Activate.findOne({ randomString: rndString }).catch((err) => {
        console.log("error found:", err)
        throw err;
    })
    if (activateFound) {
        Activate.deleteOne({ randomString: rndString }).then((result) => {
            console.log("Deleted successfully:", result)
        }).catch((err) => {
            console.log("Error with deleting activation:", err)
            throw err;
        })
        console.log(activateFound)
        let user = await User.updateOne({ _id: activateFound.userID }, { active: true }).catch((err) => {
            throw err;
        });
        if (!user) {
            throw new Error("User not updated")
        }
        return 1;
    } else {
        console.log("Activation not found")
        throw new Error("Activation string not found")
    }
}

/**
 * Resend the activation email for the user
 * @param {String} emailAddress 
 */
async function resendActivation(emailAddress) {
    user = await User.findOne({ email: emailAddress })
    if (user) {
        activate = await Activate.findOne({ userID: user._id })
        if (activate) {
            email.sendVerification(user.fullname, emailAddress, activate.randomString)
        }
    } else {
        throw new Error("Could not find user")
    }
}


module.exports = { createActivation, activateAccount, resendActivation }