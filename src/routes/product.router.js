const express = require('express');
const productController = require('../controllers/product.controller');
const router = express.Router();

// Definindo as rotas
router.get('/products', productController.getAllProducts);
router.post('/products', productController.createProduct);
router.put('/products/:id', productController.updateProduct);
router.delete('/products/:id', productController.deleteProduct);
router.get('/add', productController.renderAddProduct);
router.get('/edit/:id', productController.renderEditProduct);

module.exports = router;
