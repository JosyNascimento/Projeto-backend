// entregaParcial3/src/routes/cart.router.js
const express = require("express");
const router = express.Router();
const ticketController = require("../controllers/ticket.controller");
const { authorizationMiddleware } = require("../middlewares/auth.middleware");

const {
  createCart,
  getCartById,
  addProductToCart,
  updateCartProductQuantity,
  displayCart,
  clearCart,
  renderCarts,
} = require("../controllers/cart.controller");

// Verifique se você está passando funções aqui, e não objetos ou valores incorretos
router.post("/", authorizationMiddleware("user"), createCart); // Esta rota deve chamar createCart corretamente
router.get("/:cid", getCartById); // Esta rota está correta também
router.post("/add", addProductToCart); // A função addProductToCart deve ser um controlador, não um objeto
router.put(
  "/:cid/products/:pid",
  authorizationMiddleware("user"),
  updateCartProductQuantity
);

router.get("/", displayCart);
router.delete("/:cid", clearCart);
// Rota para realizar a compra e gerar o ticket
router.post(
  "/:cid/purchase",
  authorizationMiddleware("user"),
  ticketController.createTicket
);

// Rota para buscar um ticket específico
router.get("/ticket/:ticketId", ticketController.getTicketById);
router.get('/carts', renderCarts);
// Rota para buscar todos os tickets de um usuário
router.get(
  "/tickets",
  authorizationMiddleware("user"),
  ticketController.getTicketsByUserId
);

module.exports = router;
