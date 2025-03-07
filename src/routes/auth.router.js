const express = require("express");
const router = express.Router();
const {
  renderLoginPage,
  githubAuth,
  githubCallback,
  handleGithubCallback,
  loginUser,
  failLogin,
  logoutUser,
} = require("../controllers/authorization.controller");

router.get('/githubcallback/success', handleGithubCallback);
router.use((req, res, next) => {
  if (req.session.user) {
    res.locals.user = req.session.user;
  }
  next();
});

router.get("/login", renderLoginPage);
router.get("/github", githubAuth);
router.get("/githubcallback", githubCallback, handleGithubCallback);
router.post("/login", loginUser);
router.get("/faillogin", failLogin);
router.get("/logout", logoutUser);

module.exports = router;