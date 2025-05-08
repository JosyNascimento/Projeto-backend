// routes/cart.router.js
const express = require("express");
const router = express.Router();
const ticketController = require("../controllers/ticket.controller");
const cartController = require("../controllers/cart.controller");
const { authorizationMiddleware } = require("../middlewares/auth.middleware");

// Rota para adicionar produto ao carrinho de usuário não logado (usa cartId da sessão)
router.post('/:cartId/product/:productId', cartController.addProductToCartByCartId);

// Rota para buscar o carrinho do usuário logado
//router.get("/me", authorizationMiddleware("user"), cartController.getUserCart);

// 🔹 Carts
// Rota para visualizar todos os carrinhos (para admins ou usuários com permissão)
router.get("/:cid", cartController.getCartById); 
router.delete("/:cid", cartController.clearCart); 
router.delete("/:cid/product/:pid", authorizationMiddleware("user"), cartController.removeProductFromCart);

// 🔹 Produtos no Carrinho, Atualizar a quantidade de um produto no carrinho.
router.put("/:cid/product/:pid", authorizationMiddleware("user"), cartController.updateCartProductQuantity);

// 🔹 Tickets (compra finalizada)
router.post('/finalize-payment/:cartId', cartController.checkoutSuccess);

router.get('/purchase-success', (req, res) => {
    res.render('purchaseSuccess');
});


router.post("/:cid/purchase", authorizationMiddleware("user"), ticketController.createTicket); // Cria o ticket após a compra
router.get("/ticket/:ticketId", ticketController.getTicketById); // Exibe os detalhes de um ticket
router.get("/tickets", authorizationMiddleware("user"), ticketController.getTicketsByUserId); // Lista de tickets do usuário
router.get('/checkoutSuccess/:cartId', cartController.checkoutSuccess);
// Rota para visualizar os detalhes da compra antes de finalizar
router.get('/:cartId/checkout', authorizationMiddleware("user"), cartController.checkout);


module.exports = router;
