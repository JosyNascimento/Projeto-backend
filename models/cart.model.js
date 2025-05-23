const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    products: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            quantity: { type: Number, default: 1, min: 1 },
        },
    ],
}, { timestamps: true });

// Virtual para calcular preço total
cartSchema.virtual('totalPrice').get(function () {
    if (!this.populated('products.productId')) {
        console.warn('Atenção: products.productId não está populado. O totalPrice pode estar incorreto.');
    }

    return this.products.reduce((acc, item) => {
        const price = item.productId?.price || 0;
        return acc + item.quantity * price;
    }, 0);
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
