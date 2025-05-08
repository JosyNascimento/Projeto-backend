// src/controllers/view.controller.js
const userModel = require("../models/user.model");
const jwt = require('jsonwebtoken');
const Product = require('../models/product.model');
console.log("view.controller carregado!");
const CartRepository = require('../repositories/cart.repository');
const cartRepository = new CartRepository();
const renderHomePage = async (req, res) => {
  const token = req.cookies.token;
  try {
    // Buscar todos os produtos
    const products = await Product.find();
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await userModel.findById(decoded._id);
      cartId = user.cart || null; // Se houver um carrinho associado ao usuário
      res.render('home', { title: 'Home', user: decoded, products });
    } else {
      res.render('home', { title: 'Home', user: null, products });
    }
  } catch (error) {
    console.error("Erro ao carregar produtos:", error);
    res.status(500).send('Erro ao carregar a página inicial');
  }
};

const renderCarts = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/login');
        }

        //const userId = req.session.user.id;
        const cartId = req.params.cartId;
        const cart = await cartRepository.getCartById(cartId);
        console.log('---CARRINHO AQUI---\n', cart)
        if (cart) {
            const { totalQuantity, totalPrice } = await cartRepository.calculateCartTotals(cartId);
            console.log("Dados do carrinho:", cart, totalQuantity, totalPrice); 
            return res.render('cart', { title: 'Carrinho', cart, totalQuantity, totalPrice });
        } else {
            console.log("Carrinho vazio"); 
            return res.render('cart', { title: 'Carrinho', cart: { products: [] }, totalQuantity: 0, totalPrice: 0 });
        }
    } catch (error) {
        console.error('Erro ao renderizar carrinho:', error);
        res.status(500).send('Erro ao carregar carrinho');
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

const renderForgotPassword = (req, res) => {
  res.render('forgotPassword', { title: 'Esqueci a Senha' });
};

// Adicionando a função renderResetPassword
const renderResetPassword = (req, res) => {
  const { token } = req.params; // Recebe o token da URL
  console.log("renderResetPassword chamado!");
  res.render('resetPassword', { title: 'Redefinir Senha', token }); // Renderiza a view 'resetPassword'
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
    renderForgotPassword,
    renderResetPassword,
    renderCarts,
   };