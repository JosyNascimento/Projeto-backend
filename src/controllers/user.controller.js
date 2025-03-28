const User = require("../models/user.model");

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
  getProfile,
  changeRole,
  renderUserList,
  getAllUsers,
  togglePremium,
};
