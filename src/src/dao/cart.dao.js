// entregaParcial3/src/dao/cart.dao.js
const Cart = require('../models/cart.model'); // Importando o modelo de Cart

class CartDAO {
    async create(cartData) {
        const cart = new Cart(cartData);
        return await cart.save();
    }

    async findById(cartId) {
        return await Cart.findById(cartId).populate('products.productId'); // Populando os produtos com os detalhes do produto
    }

    async update(cartId, updateData) {
        return await Cart.findByIdAndUpdate(cartId, updateData, { new: true });
    }

    async addProductToCart(cartId, productData) {
        const cart = await this.findById(cartId);
        cart.products.push(productData); // Adicionando um produto ao carrinho
        return await cart.save();
    }

    async removeProductFromCart(cartId, productId) {
        const cart = await this.findById(cartId);
        cart.products = cart.products.filter(item => item.productId.toString() !== productId.toString());
        return await cart.save();
    }

    async delete(cartId) {
        return await Cart.findByIdAndDelete(cartId);
    }

    async findByUserEmail(email) {
        return await Cart.findOne({ purchaserEmail: email });
    }
}

module.exports = new CartDAO();
