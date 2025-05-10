// src/utils/handlebars.utils.js
const moment = require('moment');

module.exports.helpers = {
  multiply: (a, b) => {
    const valA = parseFloat(a);
    const valB = parseFloat(b);

    if (isNaN(valA) || isNaN(valB)) {
      return '0.00';
    }

    return (valA * valB).toFixed(2);
  },
  helpers: {
    formatDate: (date) => moment(date).format('DD/MM/YYYY HH:mm:ss'), 
  },
};
