// src/routes/checkout.router.js
const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkout.controller'); 

router.post('/create-payment-intent', checkoutController.createPaymentIntent);
router.get('/payment-success', checkoutController.paymentSuccess);
router.get('/checkout', checkoutController.renderCheckoutPage);// Rota para exibir a página de checkout

router.post('/checkout/process', checkoutController.processCheckout);// Rota para processar o envio do checkout

module.exports = router;