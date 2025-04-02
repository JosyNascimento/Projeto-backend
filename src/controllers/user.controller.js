const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).lean();
    if (!user) {
      return res.status(404).send("Usuário não encontrado");
    }
    res.render("userProfile", { user, title: "Perfil do Usuário" });
  } catch (error) {
    res.status(500).send("Erro ao buscar perfil do usuário");
  }
};

const renderUserList = async (req, res) => {
  console.log("renderUserList chamado!");
  console.log("req.user:", req.user);
  try {
      let users = await User.find();
      users = users.map((user) => user.toJSON());
      console.log("Usuários encontrados:", users);

      return res.render("userList", {
          users,
          user: req.user,
          isAdmin: req.user && req.user.role === "admin",
      });
  } catch (error) {
      console.error("Erro em renderUserList:", error);
      return res.render("error", { error: error.message });
  }
};


// Definição da função UserList
const UserList = async (req, res) => {
  console.log("UserList chamado!");
  console.log("req.user:", req.user);
  try {
      const users = await User.find().lean();
      res.render("userList", { users, title: "Lista de Usuários" });
  } catch (error) {
      console.error("Erro em UserList:", error);
      res.status(500).send("Erro ao buscar lista de usuários");
  }
};
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().lean();
    const user = req.user;
    res.render("adminUsers", { users, title: "Lista de Usuários", user });
  } catch (error) {
    res.status(500).send("Erro ao buscar lista de usuários");
  }
};

const changeRole = async (req, res) => {
  try {
    const { uid } = req.params;
    const user = await User.findById(uid);

    if (!user) {
      return res.status(404).send("Usuário não encontrado");
    }

    switch (user.role) {
      case "user":
        user.role = "premium";
        break;
      case "premium":
        user.role = "user";
        break;
      default:
        return res.status(400).send("Função de usuário inválida");
    }

    await user.save();
    res.redirect("/users");
  } catch (error) {
    res.status(500).send("Erro ao atualizar função do usuário");
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

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).lean(); // Supondo que o ID do usuário esteja disponível em req.user
    if (!user) {
      return res.status(404).send("Usuário não encontrado");
    }
    res.render("userProfile", { user, title: "Perfil do Usuário" });
  } catch (error) {
    console.error("Erro ao buscar perfil do usuário:", error);
    res.status(500).send("Erro ao buscar perfil do usuário");
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
console.log("🛠 Exportando renderUserList:", renderUserList);


module.exports = {
  registerUser,
  renderResetPasswordPage,
  failResetPassword,
  resetPassword,
  getProfile,
  togglePremium,
  changeRole,
  getAllUsers,
  renderUserList,
  UserList,
};
