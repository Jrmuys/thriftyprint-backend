const Crypto = require('crypto')
const Activate = require("../models/activate.model")
const email = require("./email.controller")
const User = require('../models/user.model')
const SuperStr = require('@supercharge/strings')

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

function randomString() {
    return SuperStr.random(128);
}

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


module.exports = { createActivation, activateAccount }