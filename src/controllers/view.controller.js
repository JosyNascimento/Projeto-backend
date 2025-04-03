//src/controllers/view.controller.js
const userModel = require("../models/user.model");
const jwt = require('jsonwebtoken');
const User = require("../models/user.model"); 

const renderHomePage = (req, res) => {
    const token = req.cookies.token;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.render('home', { title: 'Home', user: decoded });
      } catch (error) {
        res.render('home', { title: 'Home', user: null });
      }
    } else {
      res.render('home', { title: 'Home', user: null });
    }
  };


const renderRegisterPage = (req, res) => {
    res.render("register");
};

const renderUpdateUserPage = async (req, res) => {
    try {
        const { id } = req.params;
        let user = await userModel.findById(id);
        user = user.toJSON();
        return res.render("update", { user });
    } catch (error) {
        return res.render("error", { error: error.message });
    }
};

const renderLoginPage = (req, res) => {
    res.render('login');
};


const githubCallback = (req, res) => {
    console.log(" Callback do GitHub chamado");
    console.log("Dados de req.user do GitHub:", req.user);

    if (!req.user) {
        console.log("❌ Usuário não autenticado via GitHub");
        return res.status(401).json({ message: "Usuário não autenticado" });
    }

    req.session.user = req.user;
    res.redirect('/profile');
};

const renderProfile = (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    console.log("🔍 Usuário na sessão:", req.session.user);
    console.log("🔹 Tentando renderizar perfil...");

    res.render('profile', { user: req.session.user });

    console.log("✅ Página perfil renderizada com sucesso!");
    console.log("🔹 Finalizando a requisição...");
};

// Definição da função UserList
const renderUserList = async (req, res) => {
    console.log("renderUserList chamado!");
    console.log("req.user:", req.user);
    try {
        let users = await User.find();
        users = users.map((user) => user.toJSON());
        console.log("Usuários encontrados:", users);
  
        return res.render("userList", {
            users,
            user: req.user, // ✅ Passando o usuário para a vie
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
  
  const getAllUsers = async (req, res) => {
    try {
      const users = await User.find().lean();
      const user = req.user;
      res.render("adminUsers", { users, title: "Lista de Usuários", user });
    } catch (error) {
      res.status(500).send("Erro ao buscar lista de usuários");
    }
  };

const renderchat = (req, res) => res.render('chat');

const renderCarts = (req, res) => {
    res.render('carts', { title: 'Carrinhos' });
};


const renderProductsPage = (req, res) => {
    if (!req.session.user) {
        return res.redirect("/login");
    }

    const role = req.session.user.role;
    const username = req.session.user.email;

    res.render("products", {
        username,
        role,
        welcomeMessage: role === "admin" ? `Bem-vindo, Admin ${username}!` : `Bem-vindo, ${username}!`,
    });
};

module.exports = {
    renderHomePage,
    renderLoginPage,
    renderProductsPage,
    renderRegisterPage,
    renderUpdateUserPage,
    githubCallback,
    renderCarts,
    renderProfile,
    renderchat,
    getAllUsers,
    renderUserList,
};