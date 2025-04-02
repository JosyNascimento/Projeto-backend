const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models/user.model.js');

// Middleware de login para gerar o token
const login = async (req, res, next) => {  
    try {
        const user = await User.findOne({ username: req.body.username }); 

        if (!user) {
            return res.status(400).json({ message: 'Usuário não encontrado' });
        }

        const isValid = bcrypt.compareSync(req.body.password, user.password);
        if (!isValid) {
            return res.status(400).json({ message: 'Senha inválida' });
        }

        // Gerar o token
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'Coder', { expiresIn: '1h' });

        res.json({ message: 'Login bem-sucedido', token });
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        res.status(500).json({ message: 'Erro interno no servidor' });
    }
};

// Middleware de autenticação (verificação do token)
const autenticacao = (req, res, next) => {
    try {
        // Buscar o token do cabeçalho Authorization
        const token = req.headers.authorization?.split(' ')[1];  // 'Bearer <token>'

        if (!token) {
            return res.status(401).json({ message: 'Usuário não autenticado' });
        }

        // Verificar o token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'Coder');
        req.user = decoded;

        next(); // Permitir que a requisição continue

    } catch (error) {
        console.error('Erro de autenticação:', error);
        return res.status(401).json({ message: 'Autenticação falhou' });
    }
};

// Middleware de verificação de role "admin"
const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    res.status(403).json({ message: 'Acesso negado: apenas administradores' });
};

// Middleware de verificação de role "user"
const isUser = (req, res, next) => {
    if (req.user && req.user.role === 'user') {
        return next();
    }
    res.status(403).json({ message: 'Acesso negado: apenas usuários' });
};

// Middleware para verificar se o usuário está autenticado
const authMiddleware = (req, res, next) => {
    if (req.isAuthenticated()) {
      return next(); // O usuário está autenticado, podemos continuar
    }
    res.status(401).json({ error: "Não autorizado. Faça login primeiro." }); // Se não, retorna erro 401
  };
  
  // Middleware para verificar se o usuário é um administrador
  const adminMiddleware = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
      return next(); // O usuário tem o papel de administrador, podemos continuar
    }
    res.status(403).json({ error: "Acesso negado. Somente administradores podem realizar essa ação." }); // Se não for admin, retorna erro 403
  };
  

// Middleware de autorização com base no role
const authorizationMiddleware = (role) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: "Usuário não autenticado" });
        }

        if (req.user.role !== role) {
            return res.status(403).json({ message: `Acesso negado: necessário o papel de ${role}` });
        }

        next();
    };
};

module.exports = { 
    autenticacao, 
    authMiddleware, 
    adminMiddleware,
    login, 
    authorizationMiddleware, 
    isAdmin, 
    isUser,
};
