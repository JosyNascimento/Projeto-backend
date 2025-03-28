//routes/user.router.js
const express = require("express");
const passport = require("passport");
const authorizationMiddleware = require("../middlewares/auth.middleware");
const { autenticacao } = require("../middlewares/auth.middleware");
const userController = require("../controllers/user.controller");
const User = require('../models/user.model');
const methodOverride = require('method-override');
const {
  registerUser,
  getUserProfile,
  renderResetPasswordPage,
  failResetPassword,
  resetPassword,
} = require("../controllers/user.controller");

router.get("/registro", (req, res) => {
  res.render("registro");
});
router.post("/register", registerUser);


// Protegendo a rota /perfil corretamente com autenticação
router.get("/perfil", authorizationMiddleware.autenticacao, getUserProfile);

router.delete('/user/:email', async (req, res) => {
  try {
      const { email } = req.params;
      await User.findOneAndDelete({ email });
      res.status(200).json({ message: "Usuário deletado com sucesso!" });
  } catch (error) {
      console.error("Erro ao deletar usuário:", error);
      res.status(500).json({ error: "Erro ao deletar usuário." });
  }
});

// Rotas para redefinição de senha
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

/*
module.exports = router;
const express = require('express');
const router = express.Router();
const { getProfile, togglePremium, changeRole, getAllUsers } = require('../controllers/user.controller');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth.middleware');
const methodOverride = require('method-override');

router.use(methodOverride('_method'));
router.get('/profile', authMiddleware, getProfile);
router.get('/premium/:uid', authMiddleware, adminMiddleware, togglePremium);
router.put('/premium/:uid', authMiddleware, adminMiddleware, changeRole);
router.get('/', authMiddleware, adminMiddleware, getAllUsers);

module.exports = router;*/