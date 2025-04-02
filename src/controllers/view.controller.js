//src/controllers/view.controller.js
const userModel = require("../models/user.model");
const jwt = require('jsonwebtoken');


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

    console.log("🟢 Dados do usuário na sessão ao acessar /profile:", req.session.user);
    res.render('profile', { user: req.session.user });
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
};