// routes/cart.router.js
const express = require("express");
const router = express.Router();
const ticketController = require("../controllers/ticket.controller");
const cartController = require("../controllers/cart.controller");
const { authorizationMiddleware } = require("../middlewares/auth.middleware");

// Rota para adicionar produto ao carrinho
router.post('/:cid/product/:pid', cartController.addProductToCartByCartId);

// Rota para visualizar um carrinho pelo ID
router.get("/:cid", cartController.getCartById);

// Rota para limpar TODO o carrinho
router.delete("/:cid", cartController.clearCart);

// Rota para DELETAR APENAS UM produto do carrinho
router.delete("/:cid/product/:pid", authorizationMiddleware("user"), cartController.removeProductFromCart);

// Atualizar a quantidade de um produto no carrinho
router.put("/:cid/product/:pid", authorizationMiddleware("user"), cartController.updateCartProductQuantity);

router.get('/purchase-success', (req, res) => {
    res.render('purchaseSuccess');
});

// Rota GET para limpar TODO o carrinho (opcional, mas pode ser útil para links)
router.get('/clear/:cid', cartController.clearCart);
router.delete('/:cid', cartController.clearCart);
router.post("/:cid/purchase", authorizationMiddleware("user"), ticketController.createTicket); // Cria o ticket após a compra
router.get("/ticket/:ticketId", ticketController.getTicketById); // Exibe os detalhes de um ticket
router.get("/tickets", authorizationMiddleware("user"), ticketController.getTicketsByUserId); // Lista de tickets do usuário

module.exports = router;