// entregaParcial3/src/controllers/session.controller.js
const { generateToken } = require('../utils/jwt.utils'); 
const passport = require('../config/passport.config.js');
const bcrypt = require("bcrypt");
const User = require("../models/user.model");

const renderLoginPage = (req, res) => {
    res.render('login');
};

const githubAuth = passport.authenticate('github');

const githubCallback = (req, res) => {
    console.log("Dados de req.user do GitHub:", req.user);
    req.session.user = req.user;
    res.redirect('/perfil');
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("Tentativa de login:", email); // Adicione este log

        const user = await User.findOne({ email });

        if (!user) {
            console.log("Usuário não encontrado:", email); // Adicione este log
            return res.status(400).json({ message: "Usuário não encontrado" });
        }

           // Se comparePassword não existir, use bcrypt.compare manualmente:
        const isValid = await user.comparePassword(password);
        if (!isValid) {
            console.log("Senha inválida:", email); // Adicione este log
            return res.status(400).json({ message: "Senha inválida" });
        }

        const token = generateToken({ id: user._id, role: user.role });
        console.log("🟢 Token gerado:", token);
        res.json({ message: "Login bem-sucedido", token });
    } catch (error) {
        console.error("Erro ao fazer login:", error);
        res.status(500).json({ message: "Erro interno no servidor" });
    }
};

const failLogin = (req, res) => {
    console.log("Falha no login - usuário ou senha inválidos");
    res.redirect('/login?message=Usuário ou senha inválidos');
};

const logoutUser = async (req, res, next) => {
    await req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/');
    });
};

module.exports = {
    renderLoginPage,
    githubAuth,
    githubCallback,
    loginUser,
    failLogin,
    logoutUser
};
