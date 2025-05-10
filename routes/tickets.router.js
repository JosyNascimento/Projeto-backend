// routes/tickets.router.js
const express = require('express');
const { body, validationResult } = require('express-validator'); // Importa express-validator
const ticketsController = require('../controllers/tickets.controller');
const { isUser } = require('../middlewares/authorization.middleware');

const router = express.Router();

// Middleware de validação
const validateTicket = [
  body('products').isArray().notEmpty(),
  body('totalAmount').isNumeric().notEmpty(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

router.post('/', isUser, validateTicket, ticketsController.createTicket);

module.exports = router;