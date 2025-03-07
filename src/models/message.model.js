// Desafio10/src/dao/models/message.model.js
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  user: { type: String, required: true },
  message: { type: String, required: true },
});

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;