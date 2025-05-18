// src/controllers/view.controller.js
const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const Product = require("../models/product.model");
const CartRepository = require("../repositories/cart.repository");
const cartRepository = new CartRepository();
const ticketRepository = require("../repositories/ticket.repository");

const renderHomePage = async (req, res) => {
  const token = req.cookies.token;
  try {
    // Buscar todos os produtos
    const products = await Product.find();

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await userModel.findById(decoded._id);
      cartId = user.cart || null; // Se houver um carrinho associado ao usuário
      res.render("home", { title: "Home", user: decoded, products });
    } else {
      res.render("home", { title: "Home", user: null, products });
    }
  } catch (error) {
    console.error("Erro ao carregar produtos:", error);
    res.status(500).send("Erro ao carregar a página inicial");
  }
};

const renderCarts = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.redirect("/login");
    }

    //const userId = req.session.user.id;
    const cartId = req.params.cartId;
    const cart = await cartRepository.getCartById(cartId);
    if (cart) {
      const { totalQuantity, totalPrice } =
        await cartRepository.calculateCartTotals(cartId);
      return res.render("cart", {
        title: "Carrinho",
        cart,
        totalQuantity,
        totalPrice,
      });
    } else {
      return res.render("cart", {
        title: "Carrinho",
        cart: { products: [] },
        totalQuantity: 0,
        totalPrice: 0,
      });
    }
  } catch (error) {
    console.error("Erro ao renderizar carrinho:", error);
    res.status(500).send("Erro ao carregar carrinho");
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
  res.render("login");
};

const githubCallback = (req, res) => {
  // Lógica do callback do GitHub
  if (!req.user) {
    return res.redirect("/login");
  }
  req.session.user = req.user;
  res.redirect("/profile");
};

const renderProfile = (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  res.render("profile", { user: req.session.user });
};

const renderForgotPassword = (req, res) => {
  res.render("forgotPassword", { title: "Esqueci a Senha" });
};

// Adicionando a função renderResetPassword
const renderResetPassword = (req, res) => {
  const { token } = req.params; // Recebe o token da URL
  res.render("resetPassword", { title: "Redefinir Senha", token }); // Renderiza a view 'resetPassword'
};

const renderCheckout = async (req, res) => {
  try {
    const { cid } = req.params;

    // Obter o carrinho usando o cartId (cid)
    const cart = await cartRepository.getCartById(cid);

    if (!cart || !cart.products || cart.products.length === 0) {
      return res.status(400).send("Carrinho vazio ou não encontrado");
    }

    // Calcular o totalPrice somando o preço de cada produto * quantidade
    const totalPrice = cart.products.reduce((total, item) => {
      if (item.productId && item.productId.price) {
        return total + item.productId.price * item.quantity;
      } else {
        console.warn("Produto sem preço encontrado no carrinho:", item);
        return total; // Ou outra lógica para lidar com produtos sem preço
      }
    }, 0);

    // Renderizar a página de checkout
    res.render("checkout", {
      cartItems: cart.products,
      totalPrice,
      cartId: cid,
    });
  } catch (error) {
    console.error("Erro ao carregar checkout:", error);
    res.status(500).send("Erro ao carregar checkout.");
  }
};

const renderCheckoutSuccess = async (req, res) => {
  const ticketId = req.query.ticketId;

  if (!ticketId) {
    return res
      .status(400)
      .render("checkoutSuccess", { error: "ID do ticket não fornecido" });
  }

  try {
    // Populate products.productId and user if needed
    const ticket = await ticketRepository.getTicketById(ticketId);

    if (!ticket) {
      return res
        .status(404)
        .render("checkoutSuccess", { error: "Ticket não encontrado" });
    }

    // Manually expand product details if not populated already
    // const detailedProducts = ticket.products.map((item) => ({
    //   product: {
    //     title: item.productId.title,
    //     price: item.price,
    //   },
    //   quantity: item.quantity,
    // }));

    // // Optionally calculate total quantity and total price if used in template
    // const totalQuantity = detailedProducts.reduce(
    //   (sum, p) => sum + p.quantity,
    //   0
    // );
    // const totalPrice = detailedProducts.reduce(
    //   (sum, p) => sum + p.quantity * p.product.price,
    //   0
    // );

    return res.render("checkoutSuccess", {
      ticket,
    });
  } catch (error) {
    console.error("Erro ao carregar ticket:", error);
    return res
      .status(500)
      .render("checkoutSuccess", { error: "Erro interno ao carregar ticket" });
  }
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
  renderCheckout,
  renderCheckoutSuccess,
};
