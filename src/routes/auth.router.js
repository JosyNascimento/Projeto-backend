const express = require("express");
const router = express.Router();
const { renderRegister, renderForgotPassword } = require('../controllers/view.controller');
const {  renderLoginPage, 
  loginUser, 
  githubAuth, 
  githubCallback,
  handleGithubCallback, 
  register, 
  forgotPassword, 
  resetPassword } = require("../controllers/authorization.controller");

router.get('/githubcallback/success', handleGithubCallback);
router.use((req, res, next) => {
  if (req.session.user) {
    res.locals.user = req.session.user;
  }
  next();
});

router.get("/register", renderRegister);
router.post("/register", register);
router.get("/login", renderLoginPage);
router.get("/github", githubAuth);
router.get("/githubcallback", githubCallback, handleGithubCallback);
router.post("/login", loginUser);
router.get('/forgot-password', renderForgotPassword);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/logout', (req, res) => {
  res.clearCookie('token'); // Limpa o cookie de autenticação
  res.redirect('/login');
});

module.exports = router;