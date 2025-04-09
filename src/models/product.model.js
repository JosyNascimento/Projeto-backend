// entregaParcial3/src/dao/models/product.model.js


const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    code: { type: String, required: true, unique: true },
    stock: { type: Number, default: 0 },
    category: { type: String, required: true }, // ← esse é o que está faltando
    thumbnail: String
  });
  

const Product = mongoose.model("Product", productSchema);

module.exports = Product;