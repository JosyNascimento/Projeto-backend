// src/utils/handlebars.utils.js
const handlebars = require('handlebars');

handlebars.registerHelper('multiply', function (a, b) {
    return a * b;
});

module.exports = handlebars;