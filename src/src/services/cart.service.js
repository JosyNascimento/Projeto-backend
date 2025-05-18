const Product = require('../models/product.model'); 

const handleAddProductLogic = async (cart, productId, quantity) => {
  const product = await Product.findById(productId);
  if (!product) throw new Error('Produto não encontrado.');
  if (quantity > product.stock) throw new Error('Quantidade solicitada excede o estoque disponível');

  const existingProduct = cart.products.find(p => p.product.toString() === productId);
  if (existingProduct) {
    existingProduct.quantity += Number(quantity);
  } else {
    cart.products.push({ product: productId, quantity: Number(quantity) });
  }

  await cart.save();
};

module.exports = { handleAddProductLogic };
