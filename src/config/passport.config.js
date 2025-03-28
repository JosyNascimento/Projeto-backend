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
passport.use('register', new LocalStrategy({
    passReqToCallback: true, usernameField: 'email', passwordField: 'password'
}, async (req, username, password, done) => {
    const { first_name, last_name, email } = req.body;
    try {
        let user = await findUserByEmail(username);
        if (user) {
            console.log("Usuário já cadastrado");
            return done(null, false, { message: 'E-mail já registrado' });
        }

        const newUser = new User({ first_name, last_name, email, password: createHash(password) });
        let result = await newUser.save();
        return done(null, result);
    } catch (error) {
        console.error(`Erro ao registrar usuário: ${error}`);
        return done(null, false, { message: 'Erro ao registrar o usuário' });
    }
}));

// Estratégia de Login
passport.use('login', new LocalStrategy({ usernameField: 'email', passwordField: 'password' }, async (username, password, done) => {
    try {
        let user = await findUserByEmail(username);
        if (!user) {
            console.log("Usuário não encontrado");
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
        return done(`Erro ao autenticar usuário: ${error}`);
    }
}));

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
        done(null, user);
    } catch (error) {
        done(`Erro ao buscar usuário: ${error}`);
    }
});

module.exports = passport;