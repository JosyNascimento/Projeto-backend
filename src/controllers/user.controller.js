const User = require("../models/user.model");
const bcrypt = require("bcrypt");

async function getProfile(req, res) {
  try {
      console.log("🟢 Acessando perfil...");
      console.log("🔍 Usuário na sessão:", req.session.user);

      console.log("🔹 Tentando renderizar perfil...");
      res.redirect('/profile');  // ✅ REDIRECIONA PARA A VIEW
      console.log("✅ Página perfil renderizada com sucesso!");

      console.log("🔹 Finalizando a requisição...");
  } catch (error) {
      console.error("❌ Erro ao renderizar perfil:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
  }
}

const changeRole = async (req, res) => {
  try {
      console.log('Iniciando changeRole...');
      const { uid } = req.params;
      const { role } = req.body;
      console.log('uid:', uid, 'role:', role);
      await User.findByIdAndUpdate(uid, { role });
      console.log('Role do usuário atualizada com sucesso.');
      res.status(200).json({ message: `Role do usuário alterada para ${role} com sucesso.` });
  } catch (error) {
      console.error('Erro ao alterar role do usuário:', error);
      res.status(500).json({ message: 'Erro ao alterar role do usuário.' });
  }
};
// Função de registro de usuário
const registerUser = async (req, res) => {
  const { email, password, name } = req.body;

  try {
    const newUser = new User({ email, password, name });
    await newUser.save(); // Salva o novo usuário no banco de dados
    res.status(201).json({ message: "Usuário registrado com sucesso!" });
  } catch (error) {
    console.error("Erro ao registrar usuário:", error);
    res.status(500).json({ error: "Erro ao registrar usuário." });
  }
};
const renderResetPasswordPage = (req, res) => {
  res.render("resetPassword", { title: "Redefinir Senha" });
};

const failResetPassword = (req, res) => {
  res.status(400).render("error", {
    message: "Erro ao tentar redefinir a senha. Por favor, tente novamente.",
    title: "Erro",
  });
};

const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body; // O token será enviado no corpo da requisição junto com a nova senha

  try {
    // Verificar se o token de redefinição de senha é válido
    const tokenRecord = await resetPasswordTokenModel.findOne({ token });
    if (!tokenRecord) {
      return res.status(400).send("Token inválido ou expirado");
    }

    // Encontre o usuário associado ao token
    const user = await User.findById(tokenRecord.userId);
    if (!user) {
      return res.status(404).send("Usuário não encontrado");
    }

    // Hash a nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Atualizar a senha do usuário
    user.password = hashedPassword;
    await user.save();

    // Remover o token de redefinição, já que a senha foi alterada
    await resetPasswordTokenModel.deleteOne({ token });

    res.send("Senha alterada com sucesso");
  } catch (error) {
    console.error("Erro ao redefinir senha:", error);
    res.status(500).send("Erro ao redefinir senha");
  }
};

const togglePremium = async (req, res) => {
  try {
    const { uid } = req.params;
    const user = await User.findById(uid);
    if (!user) {
      return res.status(404).send("Usuário não encontrado");
    }
    user.role = user.role === "user" ? "premium" : "user";
    await user.save();
    res.send(`Função do usuário alterada para ${user.role}`);
  } catch (error) {
    res.status(500).send("Erro ao alterar função do usuário");
  }
};
const deleteUser = async (req, res) => {
  try {
      const { uid } = req.params;
      await User.findByIdAndDelete(uid);
      res.status(200).json({ message: 'Usuário deletado com sucesso.' });
  } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      res.status(500).json({ message: 'Erro ao deletar usuário.' });
  }
};

const adminUsers = async (req, res) => {
  try {
      const { uid } = req.params;
      const user = await User.findById(uid);
      const users = await User.find(); // Recupera a lista de usuários
      res.render('adminUsers', { user, users }); // Passa user e users para a view
  } catch (error) {
      console.error('Erro ao editar usuário:', error);
      res.status(500).send('Erro ao editar usuário.');
  }
};




module.exports = {
  registerUser,
  renderResetPasswordPage,
  failResetPassword,
  resetPassword,
  getProfile,
  togglePremium,
  changeRole,
  deleteUser,
  adminUsers,
  changeRole,
};
