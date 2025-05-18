// routes/auth.router.js
const express = require("express");
const router = express.Router();
const passport = require("passport");
const authController = require("../controllers/auth.controller");
const { registerUser, renderRegisterSuccess,} = require("../controllers/user.controller");
const {
  failResetPassword,
  renderResetPasswordPage,
  handleGithubCallback,
  resetPassword,
  forgotPassword,
  renderForgotPassword,
  logoutUser,
} = require("../controllers/auth.controller");

// Rota de início do login com GitHub
router.get(
  '/githubcallback', 
  (req, res, next) => {
    console.log("🔁 Callback GitHub - código recebido:", req.query.code);
    next();
  },
  passport.authenticate('github', {
    failureRedirect: '/login',
  }),
  (req, res) => {
    console.log("✅ GitHub login bem-sucedido! Usuário:", req.user);
    res.redirect('/perfil'); 
  }
);


// Rotas de autenticação e registro
router.post("/forgot-password", forgotPassword);
router.post("/register", registerUser);
router.get("/register/success", renderRegisterSuccess);

// Rotas para redefinir senha
router.get("/forgot-password", renderForgotPassword);
router.get("/reset-password", renderResetPasswordPage);
router.get("/logout", logoutUser);
router.get("/failreset", failResetPassword);
router.post("/reset-password/:token", // Atualizei para receber o token
  passport.authenticate("reset-password", {
    failureRedirect: "/failreset",
    failureMessage: true,
  }),
  resetPassword
);



module.exports = router;