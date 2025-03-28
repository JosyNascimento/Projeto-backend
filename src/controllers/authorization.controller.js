// /src/controllers/auth.controller.js
require("dotenv").config();
const jwt = require("jsonwebtoken");
const passport = require("passport");

const renderLoginPage = (req, res) => {
  res.render("profile");
};

const githubAuth = passport.authenticate("github", { scope: ["user:email"] });

const githubCallback = passport.authenticate("github", {
  failureRedirect: "/login",
  successRedirect: "/perfil", // Correção: redirecionamento direto para /perfil
});

const handleGithubCallback = (req, res) => {
  req.session.user = req.user;
  res.redirect("/perfil");
};

const loginUser = (req, res, next) => {
  console.log("Tentativa de login:");
  passport.authenticate("login", (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ message: "Usuário ou senha inválidos" });

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

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send('Usuário não encontrado');
    }
    // Gera um token de redefinição de senha validação de 1 hora
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hora

    await User.updateOne({ _id: user._id }, {
      resetPasswordToken: resetToken,
      resetPasswordExpires: user.resetPasswordExpires,
    });
//link para redefinir a senha enviado por email
    const resetLink = `http://localhost:8080/reset-password/${resetToken}`;
    await sendEmail(email, 'Recuperação de Senha', `Clique <a href="${resetLink}">aqui</a> para redefinir sua senha.`);
    res.redirect('/forgot-password-success');
  } catch (error) {
    res.status(500).send('Erro ao solicitar recuperação de senha');
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
      return res.status(400).send('Token inválido ou expirado');
    }
//valida se a senha foi alterada
    const isSamePassword = await bcrypt.compare(password, user.password);
    if (isSamePassword) {
      return res.status(400).send('Não é possível utilizar a mesma senha!');
    }
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.redirect('/login');
  } catch (error) {
    res.status(500).send('Erro ao redefinir senha');
  }
};

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

module.exports = {
  renderLoginPage,
  forgotPassword,
  resetPassword, 
  githubAuth,
  githubCallback,
  handleGithubCallback,
  loginUser,
  failLogin,
  logoutUser,
};