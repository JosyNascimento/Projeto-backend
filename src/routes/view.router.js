// src/routes/view.router.js
const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/auth.middleware");
const userController = require("../controllers/user.controller");
const viewController = require('../controllers/view.controller');
const adminMiddleware = require('../middlewares/admin.middleware');

console.log("renderUserList está definido?", userController.renderUserList);
console.log("✅ userController.renderUserList está definido?", typeof userController.renderUserList);
console.log("🔍 userController:", userController);
console.log("🔍 renderUserList:", userController.renderUserList);

const {
    renderHomePage,
    renderLoginPage,
    renderProductsPage,
    renderRegisterPage,
    renderUpdateUserPage,
    githubCallback,
    renderCarts,
    renderProfile,
    renderchat,
  
} = require("../controllers/view.controller");

router.get("/teste", (req, res) => {
    res.send("Rota de teste");
});
router.get("/", renderHomePage);
router.get('/', authMiddleware, adminMiddleware, viewController.getAllUsers); 
router.get("/login", renderLoginPage);
router.get("/register", renderRegisterPage);
router.get("/registerSuccess", userController.renderRegisterSuccess);
router.get("/realtimeproducts", renderProductsPage);
router.get("/chat", renderchat);
router.get("/products", renderProductsPage);
router.get("/cart",  renderCarts);
router.get("/profile",  renderProfile);
router.get('/list', viewController.renderUserList); 


module.exports = router;