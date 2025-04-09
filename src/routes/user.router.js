//routes/user.router.js
const express = require("express");
const passport = require("passport");
const authorizationMiddleware = require("../middlewares/auth.middleware");
const userController = require("../controllers/user.controller");
const User = require('../models/user.model');
const { getProfile, togglePremium, changeRole, getAllUsers, renderResetPasswordPage, failResetPassword, resetPassword } = require('../controllers/user.controller'); // Importação única
const adminMiddleware = require('../middlewares/admin.middleware');
const { authMiddleware} = require('../middlewares/auth.middleware');
const methodOverride = require('method-override');

const router = express.Router();

// Rotas de registro
router.get("/registro", (req, res) => {
  res.render("registro");
});
// Registrando um novo usuário
router.post("/registro", userController.registerUser);

// Rota para obter o perfil do usuário (protege a rota com authMiddleware)
router.get("/perfil", authorizationMiddleware.autenticacao, getProfile);

// Deletar usuário
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
// Admin rotas (usando authMiddleware e adminMiddleware para garantir que o usuário é admin)

router.use(methodOverride('_method'));
router.get('/profile', authMiddleware, getProfile);
router.get('/premium/:uid', authMiddleware, adminMiddleware, togglePremium);
router.put('/premium/:uid', authMiddleware, adminMiddleware, changeRole);
router.delete('/users/:uid', adminMiddleware, userController.deleteUser);
router.get('/admin/users/:uid', adminMiddleware, userController.adminUsers); // Rota para adminUsers.handlebars
router.put('/users/:uid/role', adminMiddleware, userController.changeRole);
router.get('/users/:id', userController.getUserById);
router.get('/users', getAllUsers);


module.exports = router;

