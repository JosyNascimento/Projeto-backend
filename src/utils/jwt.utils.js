// entregaParcial3/src/utils/jwt.utils.js
const jwt = require("jsonwebtoken");

const PRIVATE_KEY = process.env.JWT_SECRET ; // Use variável de ambiente

const generateToken = (user) => {
  return jwt.sign(user, PRIVATE_KEY, { expiresIn: "1h" });
};

// Middleware
const authToken = (req, res, next) => {
  const token = req.cookies.token || req.session.token;
  console.log("🟣 Token extraído:", token);

  if (!token) {
      return res.status(401).send({ error: "Não está autenticado" });
  }

  jwt.verify(token, PRIVATE_KEY, (err, credentials) => {
      if (err) {
          console.log("Erro ao decodificar o token:", err);
          return res.status(403).json({ error: "Não esta autorizado" });
      }
      console.log("Credenciais decodificadas:", credentials); 
      req.user = credentials;
      next();
  });
};

module.exports = {
  generateToken,
  authToken,
};
