/**
 * Defines the payment module which handles payment and order requests for the user
 * @module controller/payment
 */

const Cart = require("../models/cart.model");
const Order = require("../models/order.model");
const CartItem = require("../models/cart-item.model");
const email = require("./email.controller")
const checkoutNodeJssdk = require("@paypal/checkout-server-sdk");
const payPalClient = require("./paypalClient");
const nodemailer = require("nodemailer");

/**
 * Sets server up to be able to receive a call from the client
 * @param {Request} req 
 * @param {Response} res 
 */
async function handleRequest(req, res) {
  // Get the order ID from the request body
  const orderID = req.body.orderID;

  // Call PayPal to get the transaction details
  let request = new checkoutNodeJssdk.orders.OrdersGetRequest(orderID);

  // Define order
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
    // Validate the transaction details are as expected
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

    // Make new order object with the details from paypal and the front end
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

    // Save the order to the database
    await order.save().catch((err) => {
      console.log("error:", err);
      res
        .status(500)
        .json({ message: "An error in saving the order occurred", error: err });
    });
    console.log("Saved...");

    // Update the order array for the order
    await Order.findOneAndUpdate(
      { orderId: req.body.orderID },
      { orderItems: orderArray }
    ).catch((err) => {
      if (true) console.log("error:", err);
      res.status(500).json({
        message: "An error in updating the order occurred",
        error: err,
      });
    });
    console.log("Updated...");

    // Email user and admins about new order
    email.orderEmail(order, orderArray)
    email.adminOrderEmail(order, orderArray)

  } else {
    return res.status(400).json({ message: "Not authorized" });
  }


  // Return a successful response to the client
  return res.status(200).json({ message: "worked" });
}

module.exports = { handleRequest: handleRequest };
