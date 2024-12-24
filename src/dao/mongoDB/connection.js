const mongoose = require('mongoose');

const connectMongo = async () => {
  try {
    // Conectar ao MongoDB com opções de configuração
    await mongoose.connect('mongodb+srv://joseildatn:coder@clustercoder.f3sfq.mongodb.net/ecommerce', {
     
    });
    console.log('Conectado ao MongoDB!');
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB:', error);
    // Tentar reconectar após 5 segundos em caso de erro
    setTimeout(connectMongo, 5000);
  }
};

// Exportar a função para conexão com o banco
module.exports = connectMongo;