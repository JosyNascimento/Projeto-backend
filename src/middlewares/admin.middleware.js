// src/middlewares/admin.middleware.js

const adminMiddleware = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        // Usuário é um administrador, permita o acesso
        next();
    } else {
        // Usuário não é um administrador, negue o acesso
        res.status(403).json({ message: 'Acesso negado. Requer role de administrador.' });
    }
};

module.exports = adminMiddleware;