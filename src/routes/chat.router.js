// routes/chat.router.js
const express = require("express");
const { sendMessage } = require("../controllers/chat.controller");
const { autenticacao, isUser } = require("../middlewares/auth.middleware"); // Importe isUser

const router = express.Router();

router.post("/", autenticacao, isUser, sendMessage); // Use isUser

module.exports = router;
