require('dotenv').config(); // Coloque no topo sempre
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const bcrypt = require('bcrypt');
const User = require('../models/user.model');


// Função para buscar usuário por e-mail
const findUserByEmail = async (email) => {
    try {
        return await User.findOne({ email });
    } catch (error) {
        throw new Error(`Erro ao buscar usuário: ${error.message}`);
    }
};

// Função para verificar senha
const isValidPassword = (password, userPassword) => {
    return bcrypt.compareSync(password, userPassword);
};

// Função para gerar hash da senha
const createHash = (password) => {
    const saltRounds = 10;
    return bcrypt.hashSync(password, bcrypt.genSaltSync(saltRounds));
};

// Estratégia de Registro
passport.use('login', new LocalStrategy(
    { usernameField: 'email', passwordField: 'password' },
    async (email, password, done) => {
        try {
            const user = await User.findOne({ email });
            if (!user) {
                return done(null, false, { message: 'Usuário não encontrado' });
            }
            const validPassword = await comparePassword(password, user.password);
            if (!validPassword) {
                return done(null, false, { message: 'Senha incorreta' });
            }
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }
));


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
    callbackURL: process.env.CALLBACK_URL,
}, async (accessToken, refreshToken, profile, done) => {
    console.log('AccessToken:', accessToken);
    console.log('refreshToken:', refreshToken);
    try {
        console.log(profile);
        if (profile._json && profile._json.email && profile._json.name) {
            let user = await User.findOne({ email: profile._json.email });
            if (!user) {
                let newUser = {
                    first_name: profile._json.name.split(' ')[0],
                    last_name: profile._json.name.split(' ')[1],
                    age: profile._json.age || 18,
                    email: profile._json.email,
                    password: "",
                };
                let result = await User.create(newUser);
                return done(null, result);
            } else {
                return done(null, user);
            }
        } else {
            return done("Erro: Dados do perfil do GitHub incompletos.");
        }
    } catch (error) {
        return done(`Erro ao autenticar usuário: ${error}`);
    }
}));

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


module.exports = passport;