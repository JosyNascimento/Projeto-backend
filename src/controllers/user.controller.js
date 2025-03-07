const userRepository = require('../repositories/user.repository');
const { createHash } = require('../utils/password');

const renderLoginPage = (req, res) => {
    res.render('login');
};
const getUserById = async (req, res) => {
    try {
        const user = await userRepository.getUserById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "Usuário não encontrado" });
        }
        res.json(user);
    } catch (error) {
        console.error("Erro ao buscar usuário:", error);
        res.status(500).json({ message: "Erro ao buscar usuário" });
    }
};

const registerUser = async (req, res) => {
    try {
        const { first_name, last_name, email, password, role, avatar } = req.body;

        const existingUser = await userRepository.getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: "E-mail já cadastrado" });
        }

        const hashedPassword = await createHash(password); // ✅ Adicionado await

        const newUser = await userRepository.createUser({
            first_name,
            last_name,
            email,
            password: hashedPassword,
            role: role || "user",
            avatar: avatar || "public/img/sandra.jpg",
        });

        return res.status(201).json({ message: "Usuário cadastrado com sucesso", user: newUser });
    } catch (error) {
        console.error("Erro ao registrar usuário:", error);
        return res.status(500).json({ message: "Erro no servidor" });
    }
};

const getUserProfile = (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    console.log("Usuário logado:", req.session.user);

    const user = req.session.user?.provider === 'github' 
        ? { 
            username: req.session.user.username,
            email: req.session.user.email,
            profileUrl: req.session.user.profileUrl,
        } 
        : { 
            first_name: req.session.user.first_name,
            last_name: req.session.user.last_name,
            email: req.session.user.email,
        };

    res.render('perfil', { ...user });
};

const renderResetPasswordPage = (req, res) => {
    res.render('reset-password');
};

const failResetPassword = (req, res) => {
    const messages = req.session.messages || [];
    req.session.messages = [];
    const errorMessage = messages.length > 0 ? messages[0] : "Erro ao resetar senha";
    res.send(`Erro ao resetar senha: ${errorMessage}`);
};

const resetPassword = async (req, res) => {
    res.redirect('/login?message=Senha redefinida com sucesso');
};

const listUsers = async (req, res) => {
    try {
        const users = await userRepository.getAllUsers(); // ✅ Usando repository
        res.render('list', {
            title: 'Lista de Usuários',
            isAdmin: req.user?.role === 'admin', // ✅ Correção para evitar erro se req.user for undefined
            users,
        });
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        res.status(500).send('Erro ao buscar usuários');
    }
};

module.exports = {
    getUserById,
    registerUser,
    getUserProfile,
    renderResetPasswordPage,
    failResetPassword,
    resetPassword,
    listUsers,
};
