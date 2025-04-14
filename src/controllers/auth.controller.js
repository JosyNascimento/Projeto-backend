// /src/controllers/authorization.controller.js
require("dotenv").config();
const jwt = require("jsonwebtoken");
const passport = require("../config/passport.config.js");
const User = require("../models/user.model.js");
const crypto = require("crypto");

const getGithubAuth = () => {
  console.log("getGithubAuth foi chamado");
  const middleware = passport.authenticate("github");
  console.log("Middleware retornado:", middleware);
  return middleware;
};

const renderLoginPage = (req, res) => {
  res.render("profile");
};

const githubCallback = passport.authenticate("github", {
  failureRedirect: "/login",
  successRedirect: "/perfil", // Correção: redirecionamento direto para /perfil
});

const handleGithubCallback = (req, res) => {
  req.session.user = req.user;
  res.redirect("/perfil");
};

// Login via formulário
const loginUser = (req, res, next) => {
  console.log("Tentativa de login:");
  passport.authenticate("login", (err, user, info) => {
    if (err) return next(err);
    if (!user)
      return res.status(401).json({ message: "Usuário ou senha inválidos" });

    req.logIn(user, (err) => {
      if (err) return next(err);

      const token = jwt.sign(
        { id: req.user._id, role: req.user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
      console.log("Token gerado:", token);

      res.json({
        message: "Login bem-sucedido",
        token: token, // Correção: envia o token gerado
        user: {
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
        },
      });
    });
  })(req, res, next);
};

const renderResetPasswordPage = (req, res) => {
  res.render("resetPassword", { title: "Redefinir Senha" });
};

const failResetPassword = (req, res) => {
  res.status(400).render("error", {
    message: "Erro ao tentar redefinir a senha. Por favor, tente novamente.",
    title: "Erro",
  });
};

const renderForgotPassword = (req, res) => {
  res.render("forgotPassword");
  console.log("renderForgotPassword definido:", renderForgotPassword);
};

//2
const forgotPassword = async (req, res) => {
  try {
      const { email } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
          return res.status(404).json({ message: "Usuário não encontrado" });
      }
      // Gera um token de redefinição de senha validação de 1 hora
      const resetToken = crypto.randomBytes(20).toString("hex");
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = Date.now() + 3600000; // 1 hora

      await User.updateOne(
          { _id: user._id },
          {
              resetPasswordToken: resetToken,
              resetPasswordExpires: user.resetPasswordExpires,
          }
      );

      //link para redefinir a senha enviado por email
      const resetLink = `http://localhost:8080/reset-password/${resetToken}`;
      await sendEmail(
          email,
          "Recuperação de Senha",
          `Clique <a href="${resetLink}">aqui</a> para redefinir sua senha.`
      );

      // Após enviar o e-mail, redireciona para a página de sucesso
      res.redirect("/forgot-password-success");
  } catch (error) {
      console.error("Erro ao solicitar recuperação de senha:", error);
      res.status(500).json({ message: "Erro ao solicitar recuperação de senha", error: error.message });
  }
};


const resetPassword = async (req, res) => {
  try {
      const { token, password } = req.body;
      const user = await User.findOne({
          resetPasswordToken: token,
          resetPasswordExpires: { $gt: Date.now() },
      });
      if (!user) {
          return res.status(400).json({ message: "Token inválido ou expirado" });
      }
      //valida se a senha foi alterada
      const isSamePassword = await bcrypt.compare(password, user.password);
      if (isSamePassword) {
          return res.status(400).json({ message: "Não é possível utilizar a mesma senha!" });
      }
      user.password = password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      res.redirect("/login");
  } catch (error) {
      console.error("Erro ao redefinir senha:", error);
      res.status(500).json({ message: "Erro ao redefinir senha", error: error.message });
  }
};
// Falha no login
const failLogin = (req, res) => {
  res.status(401).json({ message: "Usuário ou senha inválidos" });
};

const logoutUser = (req, res) => {
  req.session.destroy((err) => {
    if (!err) {
      res.redirect("/login");
    } else {
      res.status(500).json({ message: "Erro no logout", error: err });
    }
  });
};

function autenticacao(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token não fornecido." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Token inválido." });
    }

    req.user = decoded;
    next();
  });
}

function isUser(req, res, next) {
  if (
    req.user.role === "user" ||
    req.user.role === "admin" ||
    req.user.role === "premium"
  ) {
    next();
  } else {
    return res
      .status(403)
      .json({ error: "Acesso negado. Apenas usuários podem acessar o chat." });
  }
}

module.exports = {
  renderLoginPage,
  forgotPassword,
  resetPassword,
  githubCallback,
  renderResetPasswordPage,
  failResetPassword,
  resetPassword,
  renderForgotPassword,
  getGithubAuth,
  handleGithubCallback,
  loginUser,
  failLogin,
  logoutUser,
  autenticacao,
  isUser,
};
