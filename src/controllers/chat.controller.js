// controllers/chat.controller.js
const Message = require("../models/chat.model"); // Importe o modelo Message

const renderchat = (req, res) =>{
    res.render("chat", { isChat: true }); // Renderiza {{> chat}} na view
  };
const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const user = req.user.email; // Obtém o email do usuário autenticado

    if (!message) {
      return res.status(400).json({ message: "Mensagem é obrigatória" });
    }

    // Salvar a mensagem no banco de dados
    const newMessage = new Message({
      user,
      message,
    });

    await newMessage.save();

    // Emitir a mensagem via socket.io
    req.io.emit("newMessage", { user, message });

    res.status(200).json({ message: "Mensagem enviada com sucesso" });
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  sendMessage,
  renderchat,
};
