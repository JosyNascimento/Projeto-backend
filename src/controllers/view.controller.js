// src/controllers/view.controller.js
const userModel = require("../models/user.model");
const jwt = require('jsonwebtoken');
const Product = require('../models/product.model');
console.log("view.controller carregado!");

const renderHomePage = async (req, res) => {
  const token = req.cookies.token;
  try {
    // Buscar todos os produtos
    const products = await Product.find();
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      res.render('home', { title: 'Home', user: decoded, products });
    } else {
      res.render('home', { title: 'Home', user: null, products });
    }
  } catch (error) {
    console.error("Erro ao carregar produtos:", error);
    res.status(500).send('Erro ao carregar a página inicial');
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
    res.render('reset-password'); 
  };

  

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