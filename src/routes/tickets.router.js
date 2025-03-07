const express = require('express');
const ticketsController = require('../controllers/tickets.controller');
const { isUser } = require('../middlewares/authorization.middleware');

const router = express.Router();

router.post('/', isUser, ticketsController.createTicket);

module.exports = router;