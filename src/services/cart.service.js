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

const removeProductFromCart = async (cartId, productId) =>{
    const cart = await this.cartRepository.getById(cartId);
    if (!cart) {
        throw new Error('Carrinho não encontrado');
    }

    const productIndex = cart.products.findIndex(p => p.productId._id.toString() === productId);

    if (productIndex === -1) {
        throw new Error('Produto não encontrado no carrinho');
    }
    cart.products.splice(productIndex, 1);

    return await this.cartRepository.update(cartId, { products: cart.products });
}

module.exports = { handleAddProductLogic, removeProductFromCart };
