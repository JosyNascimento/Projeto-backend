// src/routes/view.router.js
const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/auth.middleware");
const userController = require("../controllers/user.controller");
const viewController = require("../controllers/view.controller");
const authController = require("../controllers/auth.controller");
const productController = require("../controllers/product.controller");
const productService = require("../services/productService");
const adminMiddleware = require("../middlewares/realtimeproducts.middleware");
const cartController = require("../controllers/cart.controller");

const {
  renderLoginPage,
  renderRegisterPage,
  renderUpdateUserPage,
  githubCallback,
  renderCart,
} = require("../controllers/view.controller");

router.get("/realtimeproducts", adminMiddleware, (req, res) => {
  res.render("realtimeproducts", { title: "Realtime Products" });
});

router.get("/products", productService.getProducts);

router.get("/teste", (req, res) => {
  res.send("Rota de teste");
});
router.get("/reset-password", (req, res) => {
  res.render("forgotPassword", { title: "Esqueci a Senha" });
});

//router.get('/carts', cartController.renderCarts);
router.get("/", productController.getHomePage);
router.get('/cart', viewController.renderCart);
router.get("/login", renderLoginPage);

router.get('/', async (req, res) => {
    const products = await productController.getHomePageData(req);
    res.render('home', {
        title: 'Página Inicial',
        products: products,
        user: req.session.user // ✅ Certifique-se de que req.session.user é undefined se não logado
    });
});
router.get("/cart/:cartId", renderCart);

//router.get('/forgot-password', viewController.renderForgotPassword);
router.get("/forgot-password-info", (req, res) => {
  res.render("forgotPasswordSuccess", { title: "Link Enviado" });
});
router.get("/forgot-password-success", (req, res) => {
  res.render("forgotPasswordSuccess", { title: "Link Enviado" });
});
// Rota para renderizar a página do chat
router.get("/chat", (req, res) => {
  res.render("chat", { title: "Chat" });
});
router.get("/reset-password/:token", viewController.renderResetPassword);
router.get("/logout", authController.logoutUser);
router.get("/failreset", authController.failResetPassword);
router.get("/register", renderRegisterPage);
router.get("/registerSuccess", userController.renderRegisterSuccess);
router.get("/updateUser/:email", renderUpdateUserPage);
router.get("/produtos", productController.renderProductsPage);

router.get("/github/callback", githubCallback);
router.get("/checkout/:cid", viewController.renderCheckout);
router.get("/checkout-success", viewController.renderCheckoutSuccess);

module.exports = router;
