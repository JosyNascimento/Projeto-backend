const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const cartItemSchema = new Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: { type: Number, required: true },
});
const cartSchema = new Schema(
  {
    items: [cartItemSchema],

    // Se desejar associar a um usuário específico:
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);
const Cart = mongoose.model("Cart", cartSchema);
module.exports = Cart;
