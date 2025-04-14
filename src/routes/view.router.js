// src/routes/view.router.js
const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/auth.middleware");
const userController = require("../controllers/user.controller");
const viewController = require('../controllers/view.controller');
const adminMiddleware = require('../middlewares/admin.middleware');

console.log("viewController.getAllUsers:", viewController.getAllUsers);

const {
    renderHomePage,
    renderLoginPage,
    renderRegisterPage,
    renderUpdateUserPage,
    githubCallback,
    renderProfile,
    renderchat,
  
} = require("../controllers/view.controller");

router.get("/teste", (req, res) => {
    res.send("Rota de teste");
});
router.get("/", renderHomePage); 
router.get("/login", renderLoginPage);
router.get("/register", renderRegisterPage);
router.get("/registerSuccess", userController.renderRegisterSuccess);
router.get("/updateUser/:email", renderUpdateUserPage);


router.get("/profile",  renderProfile);


module.exports = router;