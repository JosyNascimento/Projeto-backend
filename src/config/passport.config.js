//passpor.config
require('dotenv').config(); // Coloque no topo sempre
console.log("GITHUB_CLIENT_ID:", process.env.GITHUB_CLIENT_ID);

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
passport.use('login', new LocalStrategy(
  { usernameField: 'email', passwordField: 'password' },
  async (email, password, done) => {
    try {
      let user = await User.findOne({ email });
      if (!user) {
        console.log("❌ Usuário não encontrado:", email);
        return done(null, false, { message: 'Usuário não encontrado' });
      }

      console.log("✅ Usuário encontrado:", user.email);
      console.log("🔑 Senha salva no banco:", user.password);

      const passwordMatch = await isValidPassword(password, user.password);
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
    scope: ["user:email"] // 🔥 necessário para pegar e-mail
}, async (accessToken, refreshToken, profile, done) => {
    console.log("GitHubStrategy chamada.");
    try {
         console.log("Refresh token:", refreshToken);
        console.log("Perfil do GitHub:", profile);
        console.log("GITHUB_CLIENT_ID:", process.env.GITHUB_CLIENT_ID);
        console.log("GITHUB_CLIENT_SECRET:", process.env.GITHUB_CLIENT_SECRET);
        console.log("GITHUB_CALLBACK_URL:", process.env.GITHUB_CALLBACK_URL);

        // Use the accessToken to make a request to the GitHub API
        const githubApiUrl = `https://api.github.com/user?access_token=${accessToken}`;
        const response = await fetch(githubApiUrl);
        const userData = await response.json();

        console.log("Dados do usuário do GitHub:", userData);

        const email = profile._json.email || (profile.emails && profile.emails[0] && profile.emails[0].value);

       
        if (!email) {
            return done("Erro: Nenhum e-mail disponível no perfil do GitHub.");
        }

        let user = await User.findOne({ email });

        if (!user) {
            const fullName = profile._json.name || profile.displayName || profile.username || '';
            const nameParts = fullName.split(' ');
            const firstName = nameParts[0] || 'GitHub';
            const lastName = nameParts.slice(1).join(' ') || 'User';

            let newUser = {
                first_name: firstName,
                last_name: lastName,
                age: 18,
                email: email,
                password: profile.id, // opcional — não serve como senha real
                provider: 'github' // útil para distinguir usuários OAuth
            };

            const result = await User.create(newUser);
            return done(null, result);
        } else {
            return done(null, user);
        }
    } catch (error) {
        console.error("Erro na GitHubStrategy:", error);
        return done(`Erro ao autenticar usuário: ${error}`);
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