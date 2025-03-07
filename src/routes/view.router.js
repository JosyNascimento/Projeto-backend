// entregaParcial3/src/routes/view.router.js
const express = require("express");
const router = express.Router();
const {
  renderHomePage,
  renderUserList,
  renderRegisterPage,
  renderUpdateUserPage,
  renderProductsPage,
} = require('../controllers/view.controller');

router.get("/", renderHomePage);
router.get("/list", renderUserList);
router.get("/register", renderRegisterPage);
router.get("/update/:id", renderUpdateUserPage);
router.get("/products", renderProductsPage);

module.exports = router;
