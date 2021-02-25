// 1. Set up your server to make calls to PayPal
const Cart = require("../models/cart.model");
const Order = require("../models/order.model");
const CartItem = require("../models/cart-item.model");

// 1a. Import the SDK package
const checkoutNodeJssdk = require("@paypal/checkout-server-sdk");

// 1b. Import the PayPal SDK client that was created in `Set up Server-Side SDK`.
/**
 *
 * PayPal HTTP client dependency
 */
const payPalClient = require("./paypalClient");

const nodemailer = require("nodemailer");

// 2. Set up your server to receive a call from the client
async function handleRequest(req, res) {
  // 2a. Get the order ID from the request body
  const orderID = req.body.orderID;

  // 3. Call PayPal to get the transaction details
  let request = new checkoutNodeJssdk.orders.OrdersGetRequest(orderID);

  let order;
  try {
    order = await payPalClient.client().execute(request);
  } catch (err) {
    // 4. Handle any errors from the call
    console.error(err);
    return res.send(500);
  }

  cart = await Cart.findOne({ userId: req.body.userID }).catch((err) => {
    res
      .status(500)
      .json({ message: "An error in finding the cart occurred", error: err });
  });
  if (cart) {
    // 5. Validate the transaction details are as expected
    // console.log(
    //   `Comparing prices of request: ${order.result.purchase_units[0].amount.value} with cart: ${cart.totalPrice}`
    // );
    // if (order.result.purchase_units[0].amount.value !== cart.totalPrice) {
    //   return res.send(400);
    // }
    console.log(order.result.purchase_units.shipping);
    let orderArray = new Array();
    for (var i = 0; i < cart.cartItems.length; i++) {
      cart.cartItems[i].printStatus = "NOT STARTED";
      orderArray.push(cart.cartItems[i]);
    }

    order = new Order({
      userId: req.body.userID,
      orderId: req.body.orderID,
      date: Date.parse(order.result.create_time),
      paymentDetails: {
        totalPrice: order.result.purchase_units[0].amount.value,
        paymentStatus: order.result.status,
        tax: req.body.tax,
        shipping: req.body.shipping,
      },
      orderStatus: "RECIEVED",
      customerName: req.body.userName,
      customerEmail: req.body.userEmail,
      shipping: order.result.purchase_units[0].shipping,
    });
    await order.save().catch((err) => {
      console.log("error:", err);

      res
        .status(500)
        .json({ message: "An error in saving the order occurred", error: err });
    });
    console.log("Saved...");
    await Order.findOneAndUpdate(
      { orderId: req.body.orderID },
      { orderItems: orderArray }
    ).catch((err) => {
      console.log("error:", err);
      res.status(500).json({
        message: "An error in updating the order occurred",
        error: err,
      });
    });
    console.log("Updated...");

    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "jrmuyskens@gmail.com",
        pass: "zzglxmyzczjffhbj",
      },
    });
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
      from: "jrmuyskens@gmail.com",
      to: "jrm64@students.calvin.edu",
      subject: "Sending Email using Node.js",
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
  } else {
    return res.status(400).json({ message: "Not authorized" });
  }
  console.log("now this... whoop");
  // 6. Save the transaction in your database
  // await database.saveTransaction(orderID);

  // 7. Return a successful response to the client
  return res.status(200).json({ message: "worked" });
}

module.exports = { handleRequest: handleRequest };
