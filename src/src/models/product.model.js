// entregaFinal/src/models/product.model.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, default: 0, min: 0 },
    category: { type: String },
    thumbnail: { type: String }, // imagem principal
    thumbnails: [{ type: String }], // várias imagens
    isActive: { type: Boolean, default: true }, // produto visível ou não
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // quem criou o produto

    // Variante de produto 
     variants: [
        {
             option: String, // exemplo: 'cor', 'tamanho'
            value: String,  // exemplo: 'azul', 'M'
             stock: { type: Number, default: 0, min: 0 }
         }
    ],
}, { timestamps: true });

// Índices para busca por título e categoria
productSchema.index({ title: 'text', category: 1 });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
