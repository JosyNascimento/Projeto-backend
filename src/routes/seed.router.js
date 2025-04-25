// src/routes/seed.router.js
const express = require('express');
const router = express.Router();
const Product = require('../models/product.model');
const generateMockProduct = require('../utils/generateMockProduct');

router.get('/seed', async (req, res, next) => {
  try {
    const mockProducts = Array.from({ length: 100 }, generateMockProduct);
    await Product.insertMany(mockProducts);
    res.send('✅ 100 produtos mockados foram adicionados ao banco!');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
