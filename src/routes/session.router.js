// routes/session.router.js
const express = require('express');
const sessionController = require('../controllers/session.controller');
const passport = require('../config/passport.config');
const router = express.Router();

// Middleware para definir o usuário na sessão (se existir)
router.use((req, res, next) => {
    if (req.session.user) {
        res.locals.user = req.session.user;
        console.log("Usuário na sessão:", req.session.user); // Log do usuário na sessão
    }
    next();
});

// Rotas de autenticação GitHub
router.get('/api/sessions/githubcallback', (req, res, next) => {
    console.log("Rota /api/sessions/githubcallback atingida!");
    next(); // Permite que o passport.authenticate continue
}, passport.authenticate('github', { failureRedirect: '/login' }), (req, res) => {
    console.log("Callback do GitHub bem-sucedido!");
    console.log("Usuário do GitHub:", req.user);
    req.session.user = req.user;
    res.redirect('/perfil');
});

router.post('/login', passport.authenticate("login", { failureRedirect: "/faillogin", failureMessage: true }), async (req, res) => {
    if (!req.user) {
        console.log("Falha na autenticação local.");
        return res.status(400).json({ status: "error", message: "Unauthorized" });
    }
    console.log("Autenticação local bem-sucedida:", req.user);
    req.session.user = {
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        email: req.user.email,
        age: req.user.age,
    };
    res.redirect('/perfil');
});

// Rotas de login
router.get('/login', (req, res) => {
    console.log("Rota /login atingida.");
    sessionController.renderLoginPage(req, res);
});
router.post('/login', (req, res) => {
    console.log("Rota POST /login atingida.");
    sessionController.loginUser(req, res);
});
router.get("/faillogin", (req, res) => {
    console.log("Falha na estratégia de login.");
    res.redirect('/login?message=Usuário ou senha inválidos');
});

// Rotas de logout
router.get('/logout', (req, res) => {
    console.log("Rota /logout atingida.");
    req.session.destroy(err => {
        if (!err) {
            console.log("Logout bem-sucedido.");
            res.send('Logout efetuado com sucesso!');
        } else {
            console.error("Erro no logout:", err);
            res.send({ status: 'Erro no logout', body: err });
        }
    });
});

module.exports = router;