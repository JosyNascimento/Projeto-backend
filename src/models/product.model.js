// entregaParcial3/src/dao/models/product.model.js


const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: { type: String, required: true, maxlength: 100 },
    description: { type: String, required: true, maxlength: 500 },
    price: { type: Number, required: true, min: 0 },
    category: {
        type: String,
        enum: ['Electronics', 'Clothing', 'Books', 'Other'],
        required: true,
        index: true
    },
    stock: { type: Number, default: 0, min: 0 },
    image: { type: String, match: /^https?:\/\//i }
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);

module.exports = Product;