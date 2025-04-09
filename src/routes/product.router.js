const express = require('express');
const productController = require('../controllers/product.controller');
const router = express.Router();

// Definindo as rotas
// routes/product.router.js
router.get('/', productController.getAllProducts);
router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);
router.get('/add', productController.renderAddProduct);
router.get('/edit/:id', productController.renderEditProduct);


module.exports = router;
