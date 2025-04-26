// 
const mongoose = require('mongoose');

// Habilita os logs do Mongoose
mongoose.set('debug', true);
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL); 
    console.log('Conectado ao MongoDB');
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
