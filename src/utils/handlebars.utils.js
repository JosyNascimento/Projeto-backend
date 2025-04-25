// src/utils/handlebars.utils.js
const moment = require('moment');

module.exports = {
  helpers: {
    multiply: (a, b) => a * b,
    formatDate: (date) => moment(date).format('DD/MM/YYYY HH:mm:ss'), // Exemplo de formato
  },
};
