// src/models/order.model.js
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid'); // Para gerar IDs únicos de pedido


const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      name: { type: String, required: true },
      quantity: { type: Number, required: true, min: 1 },
      price: { type: Number, required: true, min: 0 },
    },
  ],
  totalAmount: { type: Number, required: true, min: 0 },
  EnderecoDeEntrega: {
    Rua: { type: String, required: true },
    cidade: { type: String, required: true },
    Estado: { type: String, required: true },
    CEP: { type: String, required: true },
    País: { type: String, required: true },
    Informaçõesadicionais: { type: String },
  },
  paymentMethod: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending',
  },
  purchaseDate: { type: Date, default: Date.now },
  deliveryDate: { type: Date },
}, { timestamps: true }); // Adiciona createdAt e updatedAt automaticamente

const OrderModel = mongoose.model('Order', orderSchema);

// Middleware para gerar um número de pedido amigável antes de salvar
orderSchema.pre('save', async function (next) {
    if (!this.orderNumber) {
      const count = await mongoose.model('Order', orderSchema).countDocuments();
      this.orderNumber = `PED-${(count + 1).toString().padStart(6, '0')}-${new Date().getFullYear()}`;
    }
    next();
  });

module.exports = OrderModel;