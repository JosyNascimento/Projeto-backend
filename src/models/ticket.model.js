const mongoose = require('mongoose');

const generateUniqueCode = () => {
  const timestamp = Date.now().toString(36); // Converte timestamp para base 36
  const random = Math.random().toString(36).substr(2, 5); // Gera string aleatória de 5 caracteres
  return timestamp + random; // Combina timestamp e string aleatória
};

const ticketSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    default: generateUniqueCode(),  // Usa a função generateUniqueCode como valor padrão
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  products: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
  }],
  totalAmount: {
    type: Number,
    required: true,
  },
  purchaseDate: {
    type: Date,
    default: Date.now,
  },
});

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;