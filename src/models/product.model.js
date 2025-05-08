const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 },
    category: { type: String },
    // Adicione o campo para a URL da imagem principal (thumbnail)
    thumbnail: { type: String },
    // Ou, para várias imagens (thumbnails)
    thumbnails: [{ type: String }],
    // ... outros campos do seu produto
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;