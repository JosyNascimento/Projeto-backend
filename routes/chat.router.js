// routes/chat.router.js
const express = require("express");
const router = express.Router();
const { sendMessage, renderchat } = require("../controllers/chat.controller");
const { autenticacao, isUser } = require("../middlewares/auth.middleware"); // Importe isUser


router.post("/chat", autenticacao, isUser, sendMessage); // Mantenha /chat para POST
router.get('/chat', renderchat);


module.exports = router;
