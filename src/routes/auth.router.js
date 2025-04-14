const express = require("express");
const router = express.Router();
const passport = require("passport");
const authController = require("../controllers/auth.controller");
const {
  registerUser,
  renderRegisterSuccess,
} = require("../controllers/user.controller");

const {
  renderLoginPage,
  failResetPassword,
  loginUser,
  renderResetPasswordPage,
  handleGithubCallback,
  resetPassword,
  forgotPassword,
  renderForgotPassword,
} = require("../controllers/auth.controller");

router.get("/githubcallback/success", handleGithubCallback);

router.use((req, res, next) => {
  if (req.session.user) {
    res.locals.user = req.session.user;
  }
  next();
});

// Rotas de autenticação e registro
router.get("/forgot-password-success", (req, res) => {
  res.render("forgotPasswordSuccess");
});
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
