// src/routes/checkout.router.js
const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cart.controller");
const checkoutController = require("../controllers/checkout.controller");
const ticketService = require("../services/ticketService");

router.post("/create-payment-intent", checkoutController.createPaymentIntent);
router.post("/checkout/process", checkoutController.processCheckout); // Rota para processar o envio do checkout
router.post("/finalize-payment/:cartId", async (req, res) => {
  const cartId = req.params.cartId;
  const userId = req.user?.id;

  try {
    const ticket = await ticketService.createTicketFromCart(cartId, userId);
    res.redirect(`/checkout-success?ticketId=${ticket._id}`);
  } catch (error) {
    console.error("Erro ao finalizar pagamento:", error);
    res.status(500).send("Erro ao finalizar pagamento");
  }
});
module.exports = router;
