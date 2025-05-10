const productService = require("../services/productService");
const Message = require("../models/chat.model");
const chat = require("../models/chat.model");
const setupWebSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("Usuário conectado:", socket.id);

    // Enviar produtos ao conectar
    productService.getProducts().then((products) => {
      socket.emit("updateProducts", products);
    });

    // Adicionar um produto
    socket.on("addProduct", async (product) => {
      try {
        await productService.addProduct(product);
        const updatedProducts = await productService.getProducts();
        io.emit("updateProducts", updatedProducts);
      } catch (error) {
        console.error("Erro ao adicionar produto:", error);
      }
    });

    // Excluir um produto
    socket.on("deleteProduct", async (productId) => {
      try {
        await productService.deleteProduct(productId);
        const updatedProducts = await productService.getProducts();
        io.emit("updateProducts", updatedProducts);
      } catch (error) {
        socket.emit("error", {
          message: "Erro ao excluir produto",
          error: error.message,
        });
      }
    });

    // Escuta novas mensagens do cliente
    socket.on("newMessage", async ({ user, message }) => {
      const newMessage = new Message({ user, message });
      await newMessage.save();

      // Atualiza todos os usuários conectados
      const updatedMessages = await Message.find().lean();
      io.emit("messageHistory", updatedMessages);
    });

    socket.on("disconnect", () => {
      console.log("Cliente desconectado:", socket.id);
    });
  });
};

module.exports = setupWebSocket;
