const express = require("express");
const router = express.Router();
const ticketController = require("../controllers/ticket.controller");
const cartController = require("../controllers/cart.controller");
const { authorizationMiddleware } = require("../middlewares/auth.middleware");

// Rota para adicionar produto ao carrinho de usuário não logado (usa cartId da sessão)
router.post('/api/carts/:cartId/product/:productId', cartController.addProductToCartByCartId);

// 🔹 Carts
//router.post("/", authorizationMiddleware("user"), cartController.createCart);
router.get("/", cartController.renderCart);       // Página de todos os carrinhos (se for uma view)
router.get("/:cid", cartController.getCartById);     // Carrinho por ID
router.delete("/:cid", cartController.clearCart);

// 🔹 Products in Cart (para usuários possivelmente logados, usando cid e pid)
router.post('/:cid/product/:pid', cartController.addProductToCart);
router.put("/:cid/product/:pid", authorizationMiddleware("user"), cartController.updateCartProductQuantity);

// 🔹 Tickets
router.post("/:cid/purchase", authorizationMiddleware("user"), ticketController.createTicket);
router.get("/ticket/:ticketId", ticketController.getTicketById);
router.get("/tickets", authorizationMiddleware("user"), ticketController.getTicketsByUserId);

module.exports = router;