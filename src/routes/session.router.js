// src/routes/session.router.js
const express = require('express');
const passport = require('../config/passport.config');
const router = express.Router();
const { renderResetPassword } = require('../controllers/view.controller'); // Corrigido aqui

// Middleware para definir o usuário na sessão (se existir)
router.use((req, res, next) => {
    if (req.session.user) {
        res.locals.user = req.session.user;
        console.log("Usuário na sessão:", req.session.user);
    }
    next();
});

// Rota de login local (email/senha)
router.post('/login', (req, res, next) => {
    passport.authenticate('login', (err, user, info) => {
        if (err) return next(err);
        if (!user) {
            console.error("🔥 Erro interno na autenticação:", err);
            return next(err);
        }

        req.logIn(user, (err) => {
            if (err) {
                console.error("🔥 Erro ao logar o usuário:", err);
                return next(err);
            }

            req.session.user = {
                id: user._id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                role: user.role,
            };

            console.log("✅ Login bem-sucedido! Salvando sessão...");
            req.session.save((err) => {
                if (err) {
                    console.error("❌ Erro ao salvar sessão:", err);
                    return next(err);
                }
                res.redirect('/profile');  // ✅ REDIRECIONA PARA A VIEW
            });
        });
    })(req, res, next);
});

router.get('/github', passport.authenticate('github', scope = ['user:email']), (req, res) => {
    console.log(req.session);
}); // Rota para autenticação com GitHub

router.get('/githubcallback', passport.authenticate('github', { failureRedirect: '/login' }), (req, res) => {
    req.session.user = req.user; // Salva o usuário na sessão
    res.redirect('/login'); // Redireciona para a página de perfil
});

// Rota para renderizar a página de login
router.get('/login', (req, res) => {
    console.log("Rota /login atingida.");
    res.render('login');
});

// Rota para falha no login
router.get('/faillogin', (req, res) => {
    console.log("❌ Falha na estratégia de login.");
    res.status(401).json({ message: "Usuário ou senha inválidos" });
});

router.get('/reset-password', renderResetPassword);

// Rota de logout
router.get('/logout', (req, res) => {
    console.log("Rota /logout atingida.");
    req.session.destroy(err => {
        if (!err) {
            console.log("✅ Logout bem-sucedido.");
            res.redirect('/'); // ✅ Redireciona para a home após o logout
        } else {
            console.error("❌ Erro no logout:", err);
            res.status(500).json({ message: "Erro no logout", error: err });
        }
    });
});

module.exports = router;