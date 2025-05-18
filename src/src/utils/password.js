// Desafio10/utils/password.js
const bcrypt = require('bcrypt');

const createHash = (password) => {
  const saltRounds = 10;
  return bcrypt.hashSync(password, saltRounds);
};

const isValidatePassword = (password, hashedPassword) => {
  return bcrypt.compareSync(password, hashedPassword);
};

module.exports = { createHash, isValidatePassword  };
