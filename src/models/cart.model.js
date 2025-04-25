// entregaParcial3/src/models/cart.model.js
const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    products: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
            quantity: { type: Number, required: true },
        },
    ],
    
}, { timestamps: true });

cartSchema.virtual('totalPrice').get(function() {
    return this.products.reduce((acc, item) => acc + item.quantity * item.product.price, 0);
  });
  
const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
