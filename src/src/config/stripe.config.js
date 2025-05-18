// stripe.config.js
const Stripe = require("stripe");
const stripe = new Stripe("SUA_CHAVE_SECRETA");

module.exports = stripe;
