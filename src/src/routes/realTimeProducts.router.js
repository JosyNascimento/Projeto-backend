// routes/realTimeProducts.router.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/realtimeproducts.controller');
const { authorizationMiddleware } = require('../middlewares/auth.middleware');

// Página de produtos em tempo real (restrita a admin)
router.get('/', authorizationMiddleware('admin'), adminController.getRealtimeProducts);

// API para adicionar produto
router.post('/addProduct', authorizationMiddleware('admin'), adminController.addProduct);

// Deletar produto
router.delete('/product/:pid', authorizationMiddleware('admin'), adminController.deleteProduct);

// Editar produto
router.put('/product/:pid', authorizationMiddleware('admin'), adminController.editProduct);

module.exports = router;