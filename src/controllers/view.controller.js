const userModel = require("../models/user.model");

const renderHomePage = (req, res) => {
  res.render("home", { title: "Página Inicial", products: [] });
};

const renderUserList = async (req, res) => {
  console.log("na rota list");
  try {
    let users = await userModel.find();
    users = users.map((user) => user.toJSON());
    return res.render("users", { users });
  } catch (error) {
    return res.render("error", { error: error.message });
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
  renderUserList,
  renderRegisterPage,
  renderUpdateUserPage,
  renderProductsPage,
};
