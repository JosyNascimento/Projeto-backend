//src/services/productService.js

const Product = require("../models/product.model"); // importando o modelo de produtos

// Função para obter todos os produtos
const getProducts = async () => {
  try {
      return await Product.find();
  } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      throw error; // Propaga o erro para o chamador
  }
};

// Função para adicionar um novo produto
const addProduct = async (product) => {
  try {
      return await Product.create(product);
  } catch (error) {
      console.error("Erro ao adicionar produto:", error);
      throw error;
  }
};

// Função para excluir um produto pelo ID
const deleteProduct = async (productId) => {
  try {
      return await Product.findByIdAndDelete(productId);
  } catch (error) {
      console.error("Erro ao excluir produto:", error);
      throw error;
  }
};
// Exportando os métodos para uso em outros arquivos
module.exports = { getProducts, addProduct, deleteProduct };
