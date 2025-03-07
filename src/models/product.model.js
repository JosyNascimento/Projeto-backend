// entregaParcial3/src/dao/models/product.model.js


const mongoose = require('mongoose');

// Definindo o esquema de um produto
const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  stock: { type: Number, default: 0 },
  image: { type: String },
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;