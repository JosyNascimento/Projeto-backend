// src/models/Product.model.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
 stock: Number,
  category: String,
  thumbnails: [String],
  code: String,
  status: Boolean
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
