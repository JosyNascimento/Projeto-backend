const passport = require('passport');

const passportCall = (strategy) => {
    return async (req, res, next) => {
        passport.authenticate(strategy, function (err, user, info) {
            console.log("Erro de autenticação:", err);
            if (info) {
                console.log("Informações de autenticação:", info);
            }

            if (info?.message === "No auth token") {
                console.log("Token de autenticação ausente. Redirecionando para /.");
                return res.redirect("/");
            }

            if (err) {
                console.error("Erro interno do servidor durante a autenticação:", err);
                return next(err);
            }

            if (!user) {
                console.log("Falha na autenticação. Usuário não encontrado.");
                return res.status(401).send({ error: info?.message || "Unauthorized" });
            }

            req.user = user;
            console.log("Autenticação bem-sucedida. Usuário:", user.id);
            next();
        })(req, res, next);
    };
};

module.exports = passportCall;