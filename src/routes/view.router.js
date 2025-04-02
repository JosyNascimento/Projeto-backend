// src/routes/view.router.js
const express = require("express");
const { authMiddleware } = require("../middlewares/auth.middleware");
const userController = require("../controllers/user.controller");
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

// src/routes/view.router.js (modificado)
const router = express.Router();

router.get("/teste", (req, res) => {
    res.send("Rota de teste");
});
router.get("/", renderHomePage);
router.get("/login", renderLoginPage);
router.get("/register", renderRegisterPage);
router.get("/realtimeproducts", renderProductsPage);
router.get("/chat", renderchat);
router.get("/products", renderProductsPage);
router.get("/cart",  renderCarts);
router.get("/profile",  renderProfile);


router.get("/users", userController.renderUserList);


module.exports = router;