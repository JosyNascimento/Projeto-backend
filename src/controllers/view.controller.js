// src/controllers/view.controller.js
const userModel = require("../models/user.model");
const jwt = require('jsonwebtoken');



console.log("view.controller carregado!");

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

const renderForgotPassword = (req, res) => res.render('forgot-password');
console.log("renderForgotPassword definido:", renderForgotPassword);

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
  // Lógica do callback do GitHub
  if (!req.user) {
    return res.redirect('/login');
  }
  req.session.user = req.user;
  res.redirect('/profile');
};

const renderProfile = (req, res) => {
  if (!req.session.user) {
      return res.redirect('/login');
  }
  res.render('profile', { user: req.session.user });
};

// Adicionando a função renderResetPassword
const renderResetPassword = (req, res) => {
    console.log("renderResetPassword chamado!");
    res.render('reset-password'); // Certifique-se de que 'reset-password' existe
};
// Definição da função UserList






module.exports = {
    renderHomePage,
    renderLoginPage,
    renderRegisterPage,
    renderUpdateUserPage,
    renderForgotPassword,
    githubCallback,
    renderProfile,
    renderResetPassword,
   };