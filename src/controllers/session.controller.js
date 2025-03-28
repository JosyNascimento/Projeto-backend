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
    res.redirect('/profile'); // Correção aqui
};

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
        const token = generateToken({ id: user._id, role: user.role, email: user.email, user });

        // ✅ Armazena os dados do usuário na sessão
        req.session.user = {
            id: user._id,
            first_name: user.first_name || "Nome não disponível",
            last_name: user.last_name,
            email: user.email,
            role: user.role,
        };

        console.log("🟢 Login bem-sucedido. Dados do usuário armazenados:", req.session.user);

        res.cookie('token', token, { httpOnly: true });
        res.redirect('/profile');
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