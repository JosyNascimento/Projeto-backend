// src/routes/checkout.router.js
const express = require('express');
const router = express.Router();
const cartController = require("../controllers/cart.controller");
const checkoutController = require('../controllers/checkout.controller'); 

router.get('/payment-success', checkoutController.paymentSuccess);
router.get('/checkout', checkoutController.renderCheckoutPage);// Rota para exibir a página de checkout
router.get("/checkout-success", async (req, res) => {
    const { ticketId } = req.query;
  
    try {
      const ticket = await ticketService.getTicketById(ticketId);
      res.render("checkoutSuccess", { ticket });
    } catch (error) {
      console.error("Erro ao carregar página de sucesso:", error);
      res.status(500).send("Erro ao carregar página de sucesso");
    }
  });

router.get('/checkout/:cartId', cartController.getCartById)
  
router.post('/create-payment-intent', checkoutController.createPaymentIntent);
router.post('/checkout/process', checkoutController.processCheckout);// Rota para processar o envio do checkout
router.post("/finalize-payment/:cartId", async (req, res) => {
    const cartId = req.params.cartId;
  
    try {
      // Aqui você pode chamar o service que processa a compra
      const ticket = await ticketController.createTicketFromCheckout(cartId); // exemplo de função
  
      // Redireciona para a página de sucesso passando dados relevantes
      res.redirect(`/checkout-success?ticketId=${ticket._id}`);
    } catch (error) {
      console.error("Erro ao finalizar pagamento:", error);
      res.status(500).send("Erro ao finalizar pagamento");
    }
  });
module.exports = router;