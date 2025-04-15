// routes/product.router.js
const express = require('express');
const productController = require('../controllers/product.controller');
const router = express.Router();


// routes/product.router.js
router.get('/', productController.renderProductsPage);
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);
router.get('/add', productController.renderAddProduct);
router.get('/edit/:id', productController.renderEditProduct);
//router.get("/realtimeproducts", renderProductsPage);

module.exports = router;
