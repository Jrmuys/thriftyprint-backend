const mongoose = require("mongoose");
const CartItem = require("./cart-item.model");

const CartSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  cartItems: { type: [CartItem()], required: false },
  totalPrice: { type: String, required: true },
});

module.exports = mongoose.model("Cart", CartSchema);
