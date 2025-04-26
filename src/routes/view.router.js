// src/routes/view.router.js
const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/auth.middleware");
const userController = require("../controllers/user.controller");
const viewController = require('../controllers/view.controller');
const productController = require('../controllers/product.controller');
console.log("productController:", productController);
const productService = require('../services/productService');
const adminMiddleware = require('../middlewares/realtimeproducts.middleware');
const cartController = require('../controllers/cart.controller');
console.log("viewController.getAllUsers:", viewController.getAllUsers);

const {
    renderHomePage,
    renderLoginPage,
    renderRegisterPage,
    renderUpdateUserPage,
    githubCallback,
    renderProfile,
    renderCarts,
  
} = require("../controllers/view.controller");

router.get('/realtimeproducts', adminMiddleware, (req, res) => {
     res.render('realtimeproducts', { title: 'Realtime Products' });
    });
    
router.get("/teste", (req, res) => {
    res.send("Rota de teste");
});
router.get('/cart', cartController.renderCart);
router.post('/cart/add', cartController.addProductToCart);
router.get("/", productController.getHomePage);
router.get("/login", renderLoginPage);
router.get("/register", renderRegisterPage);
router.get("/registerSuccess", userController.renderRegisterSuccess);
router.get("/updateUser/:email", renderUpdateUserPage);
router.get("/produtos", productController.renderProductsPage);
router.get("/profile",  renderProfile);
router.get('/github/callback', githubCallback);

module.exports = router;