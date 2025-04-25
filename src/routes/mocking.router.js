// src/routes/mocking.router.js
const express = require('express');
const router = express.Router();
const Product = require('../models/product.model');

router.get('/mockingproducts', async (req, res, next) => {
  try {
    const products = await Product.find().limit(100).lean();
    res.render('products', {
      products,
      user: req.user || null,
      userId: req.user?._id || null,
      isAdminOrPremium: req.user?.role === 'admin' || req.user?.role === 'premium'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
