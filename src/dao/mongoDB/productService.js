// dao/MongoDB/productService.js

const Product = require("../models/product.model"); // importando o modelo de produtos

// Função para obter todos os produtos
const getProducts = async () => {
  return await Product.find();
};

// Função para adicionar um novo produto
const addProduct = async (product) => {
  return await Product.create(product);
};

// Função para excluir um produto pelo ID
const deleteProduct = async (productId) => {
  return await Product.findByIdAndDelete(productId);
};

// Exportando os métodos para uso em outros arquivos
module.exports = { getProducts, addProduct, deleteProduct };
