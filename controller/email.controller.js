/**
 * Defines the email controller which handles all email sending
 * @module controller/email
 * @author Joel Muyskens
 */

let nodemailer = require('nodemailer')
let aws = require('aws-sdk')
const config = require('../config/config')
const fs = require("fs")
const handlebars = require("handlebars")
const path = require("path")
const User = require("../models/user.model")

aws.config.update({
  accessKeyId: config.awsAccessKeyID,
  secretAccessKey: config.awsAccessKeySecret,
  region: 'us-east-1',
  signatureVersion: 'v4',
});

/**
 * Nodemailer SES transporter
 * @type {Mail} 
 */
let transporter = nodemailer.createTransport({
  SES: new aws.SES({
    apiVersion: '2010-12-01'
  })
});

/**
 * readHTML reads html from a file use the fs library
 * @param {String} path 
 * @param {Function} callback 
 */
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

/**
 * Sends a verification email using a template
 * @param {String} userName 
 * @param {String} userEmail 
 * @param {String} rndString Random string used to verify email address
 */
function sendVerification(userName, userEmail, rndString) {
  // send some mail
  const filePath = path.join(__dirname, "../email/confirmation.html")
  readHTML(filePath, function (err, html) {

    let template = handlebars.compile(html);
    let replacements = {
      user: userName,
      activateURL: "https://thriftyprint.io/auth/activate/" + rndString
    }
    let sendHtml = template(replacements)


    transporter.sendMail({
      from: 'verify@thriftyprint.io',
      to: userEmail,
      subject: 'Message',
      text: `Thanks for signing up to ThriftyPrint!\n please follow this link to verify your email address\n https://thriftyprint.io/api/activate/${rndString}`,
      html: sendHtml,
      ses: { // optional extra arguments for SendRawEmail
        Tags: [{
          Name: 'type',
          Value: 'verification'
        }]
      }
    }, (err, info) => {
      console.log(err)

    });
  })
}

/**
 * Sends a confirmation email to the user's email with all of the order details
 * @param {Order} order 
 * @param {CartItem[]} orderArray 
 */
function orderEmail(order, orderArray) {

  console.log("now this...");
  orderListItemHTML = "";
  orderArray.forEach((cartItem) => {
    orderListItemHTML += `<tr style="height: 53px;">
  <td style="width: 148px; padding:4px; text-align: center; height: 53px;">${cartItem.model.title}</td>
  <td style="width: 100px; height: 53px;">&nbsp;<img><img src="${cartItem.imgUrl}" alt="thumbnail" width="192" height="108" /></td>
  <td style="width: 259px; text-align: center; height: 53px;">${cartItem.model.quantity}</td>
  <td style="width: 135px; text-align: center; height: 53px;">${cartItem.price}</td>
  </tr>`;
  });
  console.log(orderListItemHTML);
  htmlToSend = `
  
  <p>&nbsp;</p>
<table
role="presentation"
border="0"
width="600px"
cellspacing="0"
cellpadding="0"
>
<tbody>
  <tr>
    <td style="padding: 20px 0 30px 0">
      <table
        style="

          width: 599px;
        "
        border="0"
        width="600"
        cellspacing="0"
        cellpadding="0"
        align="center"
      >
        <tbody>
          <tr>
            <td
              style="padding: 40px 0px 30px; width: 597px"
              align="center"
              bgcolor="#333333"
            >
              <img
                style="display: block"
                src="https://i.ibb.co/xhhYD8J/Logo.png"
                alt="Creating Email Magic."
                width="148"
                

              />
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px; width: 537px" bgcolor="#ffffff">
              <table
                style="border-collapse: collapse"
                border="0"
                width="100%"
                cellspacing="0"
                cellpadding="0"
              >
                  <tr>
                    
                    <h1 style="text-align: center;"><strong>New Order Recieved</strong></h1>
                    <p style="text-align: center;">order was placed at ${order.date}</p>
                    <p style="text-align: center;">order number: ${order.orderId}</p>
                    <p style="text-align: center;">username: ${order.customerName}</p>
                    <p style="text-align: center;">email: ${order.customerEmail}</p>
                    <h3 style="text-align: left;">Order Details:</h3>
                    <table style="border-collapse: collapse; border: 0px #cccccc" border="1" style="bgcolor="#ffffff"height: 72px; width: 670px;">
                      <tbody>
                        <tr style="height: 32px;">
                          <td style="width: 148px; text-align: center; height: 32px;">Model Title</td>
                          <td style="width: 100px; text-align: center; height: 32px;">&nbsp;</td>
                          <td style="width: 259px; text-align: center; height: 32px;">Quantity</td>
                          <td style="width: 135px; text-align: center; height: 32px;">Price</td>
                        </tr>
                        ${orderListItemHTML}
                        <tr style="height: 28.5px;">
                          <td style="width: 148px; text-align: center; height: 28.5px;">&nbsp;</td>
                          <td style="width: 100px; height: 28.5px;">&nbsp;</td>
                          <td style="width: 259px; text-align: center; height: 28.5px;">Total Price:</td>
                          <td style="width: 135px; text-align: center; height: 28.5px;">${order.paymentDetails.totalPrice}</td>
                        </tr>
                      </tbody>
                    </table>
                  </tr>


                </tbody>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding-top: 0px; padding: 30px; width: 537px"; bgcolor="#ee4c50">
              <table
                style="border-collapse: collapse;"
                border="0"
                width="100%"
                cellspacing="0"
                cellpadding="0"
              >
                <tbody>
                  <tr>
                    <td
                      style="
                        color: #912226;
                        font-family: Arial, sans-serif;
                        font-size: 14px;
                      "
                    >
                      <p style="margin: 0">
                        &reg; ThriftyPrint 2021<br />
                        Email questions and bug reports to
                        <a
                          style="color: #912226"
                          href="mailto:feedback@thriftyprint.io"
                          >feedback@thriftyprint.io</a
                        >
                      </p>
                    </td>
                    <td align="right">
                      <table
                        style="border-collapse: collapse;  "
                        border="0"
                        cellspacing="0"
                        cellpadding="0"
                      >
                        <tbody>
                          <tr>
                            <td>
                              <a href="https://thriftyprint.io/">
                                <img
                                  style="display: block"
                                  src="https://i.ibb.co/tMGw7yW/website-icon-01.png"
                                  alt="Twitter."
                                  width="38"
                                  height="38"
                                  border="0"
                                />
                              </a>
                            </td>
                            

                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    </td>
  </tr>
</tbody>
</table>

 `;

  var mailOptions = {
    from: "order@thriftyprint.io",
    to: order.customerEmail,
    subject: `ThriftyPrint Order: ${order.orderId} Confirmation`,
    html: htmlToSend,
  };
  console.log("sending email...");
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
    console.log("this???");
  });
  console.log("done sending email :)");
}

/**
 * Sends a notification email to the admins when an order is made, includes link to admin order page
 * @param {Order} order 
 * @param {CartItem[]} orderArray 
 */
function adminOrderEmail(order, orderArray) {

  console.log("now this...");
  orderListItemHTML = "";
  orderArray.forEach((cartItem) => {
    orderListItemHTML += `<tr style="height: 53px;">
  <td style="width: 148px; padding:4px; text-align: center; height: 53px;">${cartItem.model.title}</td>
  <td style="width: 100px; height: 53px;">&nbsp;<img><img src="${cartItem.imgUrl}" alt="thumbnail" width="192" height="108" /></td>
  <td style="width: 259px; text-align: center; height: 53px;">${cartItem.model.quantity}</td>
  <td style="width: 135px; text-align: center; height: 53px;">${cartItem.price}</td>
  </tr>`;
  });
  console.log(orderListItemHTML);
  htmlToSend = `
  
  <p>&nbsp;</p>
<table
role="presentation"
border="0"
width="600px"
cellspacing="0"
cellpadding="0"
>
<tbody>
  <tr>
    <td style="padding: 20px 0 30px 0">
      <table
        style="

          width: 599px;
        "
        border="0"
        width="600"
        cellspacing="0"
        cellpadding="0"
        align="center"
      >
        <tbody>
          <tr>
            <td
              style="padding: 40px 0px 30px; width: 597px"
              align="center"
              bgcolor="#333333"
            >
              <img
                style="display: block"
                src="https://i.ibb.co/xhhYD8J/Logo.png"
                alt="Creating Email Magic."
                width="148"
                

              />
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px; width: 537px" bgcolor="#ffffff">
              <table
                style="border-collapse: collapse"
                border="0"
                width="100%"
                cellspacing="0"
                cellpadding="0"
              >
                  <tr>
                    <a href="https://thriftyprint.com/admin/details/${order.orderId}">
                        <img href="https://i.ibb.co/tc8LjVf/Asset-1.png">
                    </a>
                    <h1 style="text-align: center;"><strong>New Order Recieved</strong></h1>
                    <p style="text-align: center;">order was placed at ${order.date}</p>
                    <p style="text-align: center;">order number: ${order.orderId}</p>
                    <p style="text-align: center;">username: ${order.customerName}</p>
                    <p style="text-align: center;">email: ${order.customerEmail}</p>
                    <h3 style="text-align: left;">Order Details:</h3>
                    <table style="border-collapse: collapse; border: 0px #cccccc" border="1" style="bgcolor="#ffffff"height: 72px; width: 670px;">
                      <tbody>
                        <tr style="height: 32px;">
                          <td style="width: 148px; text-align: center; height: 32px;">Model Title</td>
                          <td style="width: 100px; text-align: center; height: 32px;">&nbsp;</td>
                          <td style="width: 259px; text-align: center; height: 32px;">Quantity</td>
                          <td style="width: 135px; text-align: center; height: 32px;">Price</td>
                        </tr>
                        ${orderListItemHTML}
                        <tr style="height: 28.5px;">
                          <td style="width: 148px; text-align: center; height: 28.5px;">&nbsp;</td>
                          <td style="width: 100px; height: 28.5px;">&nbsp;</td>
                          <td style="width: 259px; text-align: center; height: 28.5px;">Total Price:</td>
                          <td style="width: 135px; text-align: center; height: 28.5px;">${order.paymentDetails.totalPrice}</td>
                        </tr>
                      </tbody>
                    </table>
                  </tr>


                </tbody>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding-top: 0px; padding: 30px; width: 537px"; bgcolor="#ee4c50">
              <table
                style="border-collapse: collapse;"
                border="0"
                width="100%"
                cellspacing="0"
                cellpadding="0"
              >
                <tbody>
                  <tr>
                    <td
                      style="
                        color: #912226;
                        font-family: Arial, sans-serif;
                        font-size: 14px;
                      "
                    >
                      <p style="margin: 0">
                        &reg; ThriftyPrint 2021<br />
                        Email questions and bug reports to
                        <a
                          style="color: #912226"
                          href="mailto:feedback@thriftyprint.io"
                          >feedback@thriftyprint.io</a
                        >
                      </p>
                    </td>
                    <td align="right">
                      <table
                        style="border-collapse: collapse;  "
                        border="0"
                        cellspacing="0"
                        cellpadding="0"
                      >
                        <tbody>
                          <tr>
                            <td>
                              <a href="https://thriftyprint.io/">
                                <img
                                  style="display: block"
                                  src="https://i.ibb.co/tMGw7yW/website-icon-01.png"
                                  alt="Twitter."
                                  width="38"
                                  height="38"
                                  border="0"
                                />
                              </a>
                            </td>
                            

                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    </td>
  </tr>
</tbody>
</table>

 `;

  admins = ['order@thriftyprint.io']
  admins.foreach((email) => {
    var mailOptions = {
      from: "order@thriftyprint.io",
      to: email,
      subject: `[Admin] ThriftyPrint Order: ${order.orderId} Confirmation`,
      html: htmlToSend,
    };
    console.log("sending email...");
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
      console.log("this???");
    });
    console.log("done sending email :)");
  })

}

module.exports = { sendVerification, orderEmail, adminOrderEmail }