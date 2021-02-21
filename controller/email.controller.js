let nodemailer = require('nodemailer')
let aws = require('aws-sdk')
const config = require('../config/config')
const fs = require("fs")
const handlebars = require("handlebars")
const path = require("path")

aws.config.update({
    accessKeyId: config.awsAccessKeyID,
    secretAccessKey: config.awsAccessKeySecret,
    region: 'us-east-1',
    signatureVersion: 'v4',
});

// create Nodemailer SES transporter
let transporter = nodemailer.createTransport({
    SES: new aws.SES({
        apiVersion: '2010-12-01'
    })
});

let readHTML = function (path, callback) {
    fs.readFile(path, { encoding: 'utf-8' }, function (err, html) {
        if (err) {
            throw err;
            callback(err);
        }
        else {
            callback(null, html)
        }
    });
}

function sendMail(userName, rndString) {
    // send some mail
    const filePath = path.join(__dirname, "../email/confirmation.html")
    readHTML(filePath, function (err, html) {

        let template = handlebars.compile(html);
        let replacements = {
            user: userName,
            activateURL: "https://thriftyprint.io/api/activate/" + rndString
        }
        let sendHtml = template(replacements)


        transporter.sendMail({
            from: 'verify@thriftyprint.io',
            to: 'joelmuyskens@thriftyprint.io',
            subject: 'Message',
            text: 'I hope this message gets sent!',
            html: sendHtml,
            ses: { // optional extra arguments for SendRawEmail
                Tags: [{
                    Name: 'type',
                    Value: 'verification'
                }]
            }
        }, (err, info) => {
            console.log(err)
            // console.log(info.envelope);
            // console.log(info.messageId);
        });


    })


}




module.exports = { sendMail }