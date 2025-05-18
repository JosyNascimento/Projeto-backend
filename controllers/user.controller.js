// entregaParcial3/src/controllers/user.controller.js
console.log("userController carregado!");
const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const crypto = require('crypto');

async function getProfile(req, res) {
  try {
    console.log("🟢 Acessando perfil...");
    console.log("🔍 Usuário na sessão:", req.session.user);

    console.log("🔹 Tentando renderizar perfil...");
    res.render('profile', { user: req.session.user });
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
  try {
      // Extrai os dados do corpo da requisição
      const { first_name, last_name, email, password, role, avatar } = req.body;

      // Verifica se já existe um usuário com o mesmo email
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        // Redireciona para o login com mensagem
        return res.redirect("/registro/sucesso?error=email_exists");
    }
      // // Cria o hash da senha
      // const hashedPassword = crypto.createHash('sha256').update(password).digest('hex'); // Use crypto.createHash

      // Cria um novo usuário no banco de dados
      const newUser = await User.create({
          first_name,
          last_name,
          email,
          password,
          role: role || "user", // Define o papel como "user" se não for fornecido
          avatar: avatar || "public/img/sandra.jpg", // Define um avatar padrão se não for fornecido
      });

        // Redireciona para a página de sucesso após o registro
        return res.redirect('/registerSuccess');
  } catch (error) {
      // Loga o erro e retorna uma resposta de erro interno do servidor
      console.error("Erro ao registrar usuário:", error);
      return res.status(500).json({ message: "Erro no servidor", error: error.message });
  }
};
//função para renderizar a página de sucesso
const renderRegisterSuccess = (req, res) => {
  res.render('registerSuccess');
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

// Função para buscar um usuário por ID
const getUserById = async (req, res) => {
  try {
      const { id } = req.params; // Extrai o ID dos parâmetros da rota
      const user = await User.findById(id);

      if (!user) {
          return res.status(404).json({ message: 'Usuário não encontrado' });
      }

      return res.status(200).json(user);
  } catch (error) {
      console.error("Erro ao buscar usuário por ID:", error);
      return res.status(500).json({ message: "Erro ao buscar usuário.", error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  console.log("getAllUsers chamado!");
  try {
      const users = await User.find().lean();
      const user = req.user;
      res.render("adminUsers", { users, title: "Lista de Usuários", user });
  } catch (error) {
      res.status(500).send("Erro ao buscar lista de usuários");
  }
};

const { sendEmail } = require('../utils/mailer');

// Exemplo de função para enviar um e-mail de boas-vindas
const sendWelcomeEmail = async (userEmail) => {
  try {
    await sendEmail({
      to: userEmail,
      subject: 'Bem-vindo ao nosso site!',
      html: '<h1>Obrigado por se cadastrar!</h1><p>Estamos felizes em tê-lo conosco.</p>'
    });
  } catch (error) {
    console.error('Erro ao enviar e-mail de boas-vindas:', error);
  }
};

module.exports = { sendWelcomeEmail };

const renderUserList = async (req, res) => {
  console.log("renderUserList chamado!");
  console.log("req.user:", req.user);
  try {
      let users = await User.find();
      users = users.map((user) => user.toJSON());
      console.log("Usuários encontrados:", users);

      return res.render("userList", {
          users,
          user: req.user, // ✅ Passando o usuário para a view
          isAdmin: req.user && req.user.role === "admin",
      });
  } catch (error) {
      console.error("Erro em renderUserList:", error);
      return res.status(500).render("error", {
          message: "Erro ao buscar lista de usuários.",
          error: error.message,
      });
  }
};


module.exports = {
  registerUser,
  renderRegisterSuccess,
  getProfile,
  togglePremium,
  changeRole,
  deleteUser,
  adminUsers,
  getUserById,
  sendWelcomeEmail,
  getAllUsers,
  renderUserList,
};

