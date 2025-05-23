// routes/cart.router.js
const express = require("express");
const router = express.Router();
const ticketController = require("../controllers/ticket.controller");
const cartController = require("../controllers/cart.controller");
const { isAuthenticated } = require('../middlewares/auth.middleware');
const { authorizationMiddleware } = require("../middlewares/auth.middleware");
const { jwtAuthMiddleware } = require("../middlewares/auth.middleware"); // ajuste o caminho se necessário
// Importando as funções específicas para uso direto no router
const {
    addProductToCartByCartId,
    getCartById,
    removeProductFromCart, 
    updateCartProductQuantity,
    clearCart,
    createCart
} = cartController;
// Rota para adicionar produto ao carrinho
router.post('/:cid/product/:productId', cartController.addProductToCartByCartId);


// Rota para visualizar um carrinho pelo ID
router.get("/:cid", authorizationMiddleware("user"), cartController.getCartById);

// Rota para DELETAR APENAS UM produto do carrinho
router.delete('/:cid/product/:productId', // <--- ATENÇÃO AQUI!
    (req, res, next) => {
        console.log('>>> Rota DELETE /cart/:cid/product/:productId atingida!');
        console.log('Parâmetros da Rota:', req.params);
        next();
    }, 
    removeProductFromCart // Use a função importada diretamente
);

// Atualizar a quantidade de um produto no carrinho
router.put("/:cid/product/:id", authorizationMiddleware("user"), cartController.updateCartProductQuantity);

router.get('/purchase-success', (req, res) => {
    console.log(req.query); 
    res.render('purchaseSuccess');
});

// Rota GET para limpar TODO o carrinho (opcional, mas pode ser útil para links)
router.get("/clear/:cid", authorizationMiddleware("user"), cartController.clearCart);
router.post("/:cid/purchase", authorizationMiddleware("user"), ticketController.createTicket); // Cria o ticket após a compra
router.get("/ticket/:ticketId", ticketController.getTicketById); // Exibe os detalhes de um ticket
router.get("/tickets", authorizationMiddleware("user"), ticketController.getTicketsByUserId); // Lista de tickets do usuário

module.exports = router;