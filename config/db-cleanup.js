const cron = require('node-cron')
const Activate = require("../models/activate.model")
const User = require("../models/user.model");
const config = require('./config');
const AWS = require("aws-sdk");
const Model = require("../models/model.model");

AWS.config.update({
    accessKeyId: config.s3AccessKeyID,
    secretAccessKey: config.s3SecretAcessKey,
    signatureVersion: 'v4',
});

const S3 = new AWS.S3();

cron.schedule('00 01 * * *', async function () {
    console.log(`Cleaning verification collection...
=======================================================
    This job was executed at: `, Date.now())
    for await (const activate of Activate.find()) {
        console.log("\tActivate: ", activate._id)
        user = await User.findOne({ _id: activate.userID }).catch((err) => {
            console.error("\tError finding user", err)
        })
        if (user) {
            console.log("\t\tFound user for this activate, active? ", user.active)
            if (user.active) {
                console.log("\t\tUser already activated")
                result = await Activate.findOneAndDelete({ _id: activate._id }).catch(err => {
                    console.error("\t\tError deleting activation", err)
                })
                if (result) {
                    console.log("\t\tSuccessfully deleted activation")
                }

            }
        } else {
            console.log("\t\tUser not found, deleting activate")
            result = await Activate.findOneAndDelete({ _id: activate._id }).catch(err => {
                console.error("\t\tError deleting activation", err)
            })
            if (result) {
                console.log("\t\tSuccessfully deleted activation")
            }
        }

    }
    console.log("Finished cleaning verification.")
})

function deleteS3File(filepath) {
    let params = {
        Bucket: config.s3BucketName,
        Key: `${filepath}`
    }
    S3.deleteObject(params, function (err, data) {
        if (data) {
            console.log("File deleted successfully")
        } else {
            console.log("Check permissions", err)
        }
    })
}

/**
 * Find all models
 * Find all orders
 * Find all carts
 * 1. Check if the model is over a month old
 * 2. If so, check if the model id is in any cart
 * 3. If not, check if the model id is in any orders,
 * 4. If all these are met (> 1 month old, not in any cart or order):
 *      delete the model file
 *
 */
// cron.schedule('* * * * *', async function () {
//     s3_inner_folder = "model_files"
//     console.log("Clearing model files and models")
//     for await (const model of Model.find()) {
//         // console.log(model)
//         if (model.createdOn) {

//             if (model._id == '60395fbdaad6bb12fce5abc1') {
//                 file = model.filePath.split('/').pop()
//                 console.log("Path: ", file)
//                 deleteS3File(`${s3_inner_folder}/${file}`)
//                 Model.deleteOne({ _id: model._id }).then((result) => {
//                     console.log("Deleted model from db...")
//                 })
//             }

//             if (Date.now() - model.createdOn > 1000/*ms*/ * 60/*s*/ * 60/*min*/ * 24/*h*/ * 30/*days*/ * 1/*months*/) {

//             }

//         } else {
//             console.log("No date, deleting model...")
//             console.log(model.filePath)
//         }
//     }
// })