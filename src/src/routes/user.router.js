//routes/user.router.js
const express = require("express");
const passport = require("passport");
const authorizationMiddleware = require("../middlewares/auth.middleware");
const userController = require("../controllers/user.controller");
const User = require('../models/user.model');
const { getProfile, togglePremium, changeRole, getAllUsers, renderResetPasswordPage, failResetPassword, resetPassword } = require('../controllers/user.controller'); // Importação única
const adminMiddleware = require('../middlewares/realtimeproducts.middleware');
const { autenticacao, authMiddleware, isAdmin} = require('../middlewares/auth.middleware'); // Importe autenticacao corretamente
const methodOverride = require('method-override');

const router = express.Router();




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

// Admin rotas (usando authMiddleware e adminMiddleware para garantir que o usuário é admin)

// GET perfil do usuário logado
router.get("/perfil", authMiddleware, getProfile);

// Alterações e exclusões (usuário/admin)
router.get('/premium/:uid', authMiddleware, adminMiddleware, togglePremium);
router.put('/premium/:uid', authMiddleware, adminMiddleware, changeRole);
router.delete('/users/:uid', adminMiddleware, userController.deleteUser);
router.get('/admin/users/:uid', adminMiddleware, userController.adminUsers);
router.put('/users/:uid/role', adminMiddleware, userController.changeRole);
router.get('/users/:id', userController.getUserById);
router.get('/users', getAllUsers);
router.get('/list', autenticacao, isAdmin, userController.renderUserList);



module.exports = router;

