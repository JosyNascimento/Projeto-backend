// routes/auth.router.js
const express = require("express");
const router = express.Router();
const passport = require("passport");
const authController = require("../controllers/auth.controller");
const {
  registerUser,
  renderRegisterSuccess,
} = require("../controllers/user.controller");

const {
  failResetPassword,
  renderResetPasswordPage,
  handleGithubCallback,
  resetPassword,
  forgotPassword,
  renderForgotPassword,
} = require("../controllers/auth.controller");

// Rota de início do login com GitHub
router.get("/github",passport.authenticate("github", { scope: ["user:email"] })
);
router.get('/githubcallback', passport.authenticate('github', {
  failureRedirect: '/login',
}), (req, res, next) => {
  handleGithubCallback(req, res, next);
});

// Rotas de autenticação e registro
router.get("/forgot-password", (req, res) => {
  res.render("forgotPassword");
});
router.post("/forgot-password", forgotPassword);
router.post("/register", registerUser);
router.get("/register/success", renderRegisterSuccess);

// Rotas para redefinir senha
router.get("/forgot-password", renderForgotPassword);
router.get("/reset-password", renderResetPasswordPage);
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (!err) {
      res.clearCookie("token");
      res.redirect("/login");
    } else {
      res.status(500).json({ message: "Erro no logout", error: err });
    }
  });
});
router.get("/failreset", failResetPassword);
router.post(
  "/reset-password",
  passport.authenticate("reset-password", {
    failureRedirect: "/failreset",
    failureMessage: true,
  }),
  resetPassword
);

module.exports = router;
