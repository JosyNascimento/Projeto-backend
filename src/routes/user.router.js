const express = require("express");
const passport = require("passport");
const authorizationMiddleware = require("../middlewares/authorization.middleware");

const {
  registerUser,
  getUserProfile,
  renderResetPasswordPage,
  failResetPassword,
  resetPassword,
  listUsers,
} = require("../controllers/user.controller");

const router = express.Router();

router.get("/registro", (req, res) => {
  res.render("registro");
});
router.post("/register", registerUser);

// Protegendo a rota /perfil corretamente com autenticação
router.get("/perfil", authorizationMiddleware.autenticacao, getUserProfile);

// Rotas para redefinição de senh
router.get("/reset-password", renderResetPasswordPage);
router.get("/failreset", failResetPassword);
router.post(
  "/reset-password",
  passport.authenticate("reset-password", {
    failureRedirect: "/failreset",
    failureMessage: true,
  }),
  resetPassword
);
// Listagem de usuários (admin)
router.get("/list", listUsers);

module.exports = router;
