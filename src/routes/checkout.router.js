// routes/checkout.router.js
const express = require('express');
const router = express.Router();
const { createPaymentIntent } = require('../controllers/checkout.controller');
const { paymentSuccess } = require('../controllers/checkout.controller');

// Rota para criar um intent de pagamento
router.post('/create-payment-intent', createPaymentIntent);

//router.get('/success', paymentSuccess);

// Rota que mostra a página de sucesso após pagamento aprovado
router.get('/success', (req, res) => {
  res.render('checkoutSuccess'); // renderiza a view
});

module.exports = router;
