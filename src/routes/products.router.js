// routes/products.router.js
const express = require('express');
const productController = require('../controllers/product.controller');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Produtos (Views)
 *   description: Páginas renderizadas de produtos
 */

router.get('/', productController.getHomePage); // Página home
router.get('/products', productController.getAllProducts);
//router.get('/products', productController.renderProductsPage); // Vitrine com permissões
router.get('/add', productController.renderAddProduct);
router.get('/edit/:id', productController.renderEditProduct);

module.exports = router;
