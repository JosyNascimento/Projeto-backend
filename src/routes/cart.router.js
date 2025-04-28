const express = require("express");
const router = express.Router();
const ticketController = require("../controllers/ticket.controller");
const cartController = require("../controllers/cart.controller");
const { authorizationMiddleware } = require("../middlewares/auth.middleware");

// Rota para adicionar produto ao carrinho de usuário não logado (usa cartId da sessão)
router.post('/api/carts/:cartId/product/:productId', cartController.addProductToCartByCartId);

// 🔹 Carts
// Rota para visualizar todos os carrinhos (para admins ou usuários com permissão)
router.get("/", cartController.renderCart); // Exibe todos os carrinhos (se for uma view)
router.get("/:cid", cartController.getCartById); // Exibe um carrinho específico
router.delete("/:cid", cartController.clearCart); // Limpa o carrinho

// 🔹 Produtos no Carrinho
// Adicionar produto ao carrinho de um usuário logado
router.post('/:cid/product/:pid', authorizationMiddleware("user"), cartController.addProductToCart);

// Atualizar a quantidade de um produto no carrinho
router.put("/:cid/product/:pid", authorizationMiddleware("user"), cartController.updateCartProductQuantity);

// 🔹 Tickets (compra finalizada)
router.post("/:cid/purchase", authorizationMiddleware("user"), ticketController.createTicket); // Cria o ticket após a compra
router.get("/ticket/:ticketId", ticketController.getTicketById); // Exibe os detalhes de um ticket
router.get("/tickets", authorizationMiddleware("user"), ticketController.getTicketsByUserId); // Lista de tickets do usuário

module.exports = router;
