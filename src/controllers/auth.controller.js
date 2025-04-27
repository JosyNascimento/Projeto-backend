// /src/controllers/auth.controller.js
require("dotenv").config();
const jwt = require("jsonwebtoken");
const { generateToken } = require('../utils/jwt.utils');
const passport = require("../config/passport.config.js");
const User = require("../models/user.model.js");
const nodemailer = require('nodemailer'); // Para enviar emails
const crypto = require("crypto");
const { sendEmail } = require('../utils/mailer');
const renderLoginPage = (req, res) => {
  res.render("profile");
};

const getGithubAuth = () => {
  console.log("getGithubAuth foi chamado");
  const middleware = passport.authenticate("github");
  console.log("Middleware retornado:", middleware);
  return middleware;
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
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("Tentativa de login:", email);

        const user = await User.findOne({ email });

        if (!user) {
            console.log("Usuário não encontrado:", email);
            return res.status(400).json({ message: "Usuário não encontrado" });
        }

        const isValid = await user.comparePassword(password);
        if (!isValid) {
            console.log("Senha inválida:", email);
            return res.status(400).json({ message: "Senha inválida" });
        }

        const token = generateToken({ id: user._id, role: user.role, email: user.email });

        req.session.user = {
            id: user._id,
            first_name: user.first_name || "Nome não disponível",
            last_name: user.last_name,
            email: user.email,
            role: user.role,
        };

        console.log("🟢 Login bem-sucedido:", req.session.user);

        res.cookie('token', token, { httpOnly: true });
        res.redirect('/profile');
    } catch (error) {
        console.error("Erro ao fazer login:", error);
        res.status(500).json({ message: "Erro interno no servidor" });
    }
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


const forgotPassword = async (req, res) => {
  try {
      const { email } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        return res.render('forgotPasswordSuccess', { message: 'Se este e-mail estiver registrado, um link de recuperação foi enviado.' });
      }
      // Gera um token de redefinição de senha validação de 1 hora
      const resetToken = crypto.randomBytes(20).toString("hex");
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = Date.now() + 3600000; // 1 hora
  

      await sendEmail({
        to: user.email,
        subject: 'Link para redefinição de senha',
        html: `
          <p>Você solicitou a redefinição da sua senha.</p>
          <p><a href="${resetLink}">Clique aqui para redefinir</a></p>
          <p>Este link expira em 1 hora.</p>
        `,
      });
      

      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_SECURE === 'true', // Converte string para boolean
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
      const resetLink = `http://localhost:8080/reset-password/${resetToken}`; // Link para a página de redefinição
  
      const mailOptions = {
        to: user.email,
        subject: 'Link para redefinição de senha',
        html: `<p>Você solicitou a redefinição da sua senha. Clique no link abaixo para prosseguir:</p><a href="${resetLink}">Redefinir senha</a><p>Este link é válido por 1 hora.</p>`,
      };
  
      await transporter.sendMail(mailOptions)
      .then(info => {
        console.log('E-mail enviado:', info);
        res.render('forgotPasswordSuccess', { message: 'Um link de recuperação de senha foi enviado para o seu e-mail.' });
      })
      .catch(error => {
        console.error('Erro ao enviar e-mail:', error);
        res.render('forgotPassword', { message: 'Ocorreu um erro ao enviar o e-mail de recuperação.' });
      });

  } catch (error) {
    console.error('Erro ao solicitar recuperação de senha:', error);
    res.render('forgotPassword', { message: 'Ocorreu um erro ao processar sua solicitação.' });
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
    const isSamePassword = await bcrypt.compare(password, user.password);
    if (isSamePassword) {
      return res.status(400).json({ message: "Não é possível utilizar a mesma senha!" });
    }
    const hashedPassword = await bcrypt.hash(password, 10); // Hash a nova senha
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.redirect("/login?message=Senha redefinida com sucesso"); // Adicione mensagem de sucesso na query
  } catch (error) {
    console.error("Erro ao redefinir senha:", error);
    res.status(500).json({ message: "Erro ao redefinir senha", error: error.message });
  }
};

const renderResetPasswordPage = (req, res) => {
  const { token } = req.params;
  res.render('resetPassword', { token });
};

// Falha no login
const failLogin = (req, res) => {
  res.status(401).json({ message: "Usuário ou senha inválidos" });
};

const logoutUser = (req, res) => {
  req.session.destroy((err) => {
    if (!err) {
      res.clearCookie("token");
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
