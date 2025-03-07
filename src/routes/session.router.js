// entregaParcial3/src/routes/session.router.js
const express = require('express');
const sessionController = require('../controllers/session.controller'); 

const router = express.Router();

// Middleware para definir o usuário na sessão (se existir)
router.use((req, res, next) => {
    if (req.session.user) {
        res.locals.user = req.session.user;
    }
    next();
});

// Rotas de login
router.get('/login', sessionController.renderLoginPage);
router.post('/login', sessionController.loginUser);
router.get('/faillogin', sessionController.failLogin);

// Rotas de logout
router.get('/logout',  sessionController.logoutUser);

// Rotas de autenticação GitHub
router.get('/github', sessionController.githubAuth);
router.get('/githubcallback', sessionController.githubCallback);
 


module.exports = router;