require('dotenv').config(); // topo sempre
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const bcrypt = require('bcrypt');
const User = require('../models/user.model');


// Função para verificar senha
const isValidPassword = (password, userPassword) => {
    return bcrypt.compareSync(password, userPassword);
};

// Função para gerar hash da senha
const createHash = (password) => {
    const saltRounds = 10;
    return bcrypt.hashSync(password, bcrypt.genSaltSync(saltRounds));
};

// Estratégia de Login
passport.use('login', new LocalStrategy({ usernameField: 'email', passwordField: 'password' }, 
    async (email, password, done) => {
        try {
            let user = await User.findOne({ email });
            if (!user) {
                console.log("❌ Usuário não encontrado:", email);
                return done(null, false, { message: 'Usuário não encontrado' });
            }

            console.log("✅ Usuário encontrado:", user.email);
            console.log("🔑 Senha salva no banco:", user.password);

            const passwordMatch = isValidPassword(password, user.password);
            console.log("🔍 Comparação de senha:", passwordMatch);

            if (!passwordMatch) {
                console.log("❌ Senha inválida");
                return done(null, false, { message: 'Senha inválida' });
            }

            return done(null, user);
        } catch (error) {
            console.error("🔥 Erro interno na autenticação:", error);
            return done(error);
        }
    }
));


// Estratégia de Login com GitHub
passport.use('github', new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL,
}, async (accessToken, refreshToken, profile, done) => {
    try {
        console.log('✅ Acesso autorizado do GitHub');
        console.log('AccessToken:', accessToken);
        console.log('RefreshToken:', refreshToken);
        console.log('Profile:', profile);

        const existingUser = await User.findOne({ email: profile._json.email });

        if (existingUser) return done(null, existingUser);

        const newUser = await User.create({
            first_name: profile._json.name?.split(' ')[0] || profile.username,
            last_name: profile._json.name?.split(' ')[1] || '',
            age: 18, // Ajuste se necessário
            email: profile._json.email,
            password: createHash(profile.id) // Gera um hash para o ID do GitHub
        });

        return done(null, newUser);
    } catch (error) {
        console.error('🔥 Erro ao autenticar com GitHub:', error);
        return done(error);
    }
}));

// Serialização do usuário
passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
    try {
        let user = await User.findById(id);
        if (!user) {
            console.log("⚠️ Usuário não encontrado no deserializeUser:", id);
            return done(null, false);
        }
        done(null, user);
    } catch (error) {
        console.error("🔥 Erro ao buscar usuário no deserializeUser:", error);
        done(error);
    }
});

// Estratégia de Reset de Senha
passport.use('reset-password', new LocalStrategy({ usernameField: 'email', passwordField: 'password' }, async (username, password, done) => {
    try {
        const userFound = await User.findOne({ email: username });

        if (!userFound) {
            console.log("User not found");
            return done(null, false, { message: 'Usuário não encontrado' });
        }
        const newPass = createHash(password);

        await User.updateOne({ email: username }, { password: newPass });
        return done(null, userFound);
    } catch (error) {
        return done(null, false, { message: `Erro ao alterar a password do usuário: ${error}` });
    }
}));




module.exports = passport;