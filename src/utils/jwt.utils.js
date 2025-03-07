// entregaParcial3/src/utils/jwt.utils.js
const jwt = require("jsonwebtoken");

const PRIVATE_KEY = process.env.JWT_SECRET || "Coder"; // Use variável de ambiente

const generateToken = (user) => {
  return jwt.sign(user, PRIVATE_KEY, { expiresIn: "1h" });
};

// Middleware
const authToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  console.log("🔵 Header Authorization recebido:", authHeader); // LOG DO HEADER RECEBIDO

  if (!authHeader) {
      return res.status(401).send({ error: "Não está autenticado" });
  }
  const token = authHeader.split(" ")[1];
  console.log("🟣 Token extraído:", token); // LOG DO TOKEN EXTRAÍDO

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded)=> {
    if (err) {
      console.log(err);
      return res.status(403).json({ error: "Token inválido" });
    }
    req.user = credentials;
    next();
  });
};

module.exports = {
  generateToken,
  authToken,
};
