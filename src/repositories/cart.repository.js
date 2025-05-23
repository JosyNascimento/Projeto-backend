const Cart = require('../models/cart.model');

class CartRepository {
    async getCartById(id) {
        try {
            return await Cart.findById(id).populate('products.productId');
        } catch (error) {
            console.error('Erro ao buscar carrinho por ID:', error);
            throw error;
        }
    }

    async getCartByUserId(userId) {
        try {
            const cart = await Cart.findOne({ userId }).populate('products.productId');
            return cart;
        } catch (error) {
            console.error('Erro ao buscar carrinho por userId:', error);
            throw error;
        }
    }

    async createCart(cartData) {
        try {
            return await Cart.create(cartData);
        } catch (error) {
            console.error('Erro ao criar carrinho:', error);
            throw error;
        }
    }

    async updateCart(id, cartData) {
        try {
            return await Cart.findByIdAndUpdate(id, cartData, { new: true }).populate('products.productId');
        } catch (error) {
            console.error('Erro ao atualizar carrinho:', error);
            throw error;
        }
    }

    async deleteCart(id) {
        try {
            return await Cart.findByIdAndDelete(id);
        } catch (error) {
            console.error('Erro ao deletar carrinho:', error);
            throw error;
        }
    }

    async addProductToCart(cartId, productId, quantity = 1) {
        try {
            const cart = await Cart.findById(cartId);
            if (!cart) throw new Error('Carrinho não encontrado');

            const existingProduct = cart.products.find(p => p.productId.toString() === productId);
            if (existingProduct) {
                existingProduct.quantity += quantity;
            } else {
                cart.products.push({ productId, quantity });
            }

            await cart.save();
            return await cart.populate('products.productId');
        } catch (error) {
            console.error('Erro ao adicionar produto ao carrinho:', error);
            throw error;
        }
    }

    async removeProductFromCart(cartId, productId) {
        try {
            const cart = await Cart.findById(cartId);
            if (!cart) throw new Error('Carrinho não encontrado');

            cart.products = cart.products.filter(p => p.productId.toString() !== productId.toString());

            await cart.save();
            return await cart.populate('products.productId');
        } catch (error) {
            console.error('Erro ao remover produto do carrinho:', error);
            throw error;
        }
    }

    async clearCart(cartId) {
        try {
            const cart = await Cart.findById(cartId);
            if (!cart) throw new Error('Carrinho não encontrado');

            cart.products = [];
            await cart.save();
            return await cart.populate('products.productId');
        } catch (error) {
            console.error('Erro ao limpar carrinho:', error);
            throw error;
        }
    }

    async getCartTotal(cartId) {
        try {
            const cart = await Cart.findById(cartId).populate('products.productId');
            if (!cart) throw new Error('Carrinho não encontrado');

            const total = cart.products.reduce((sum, item) => {
                const price = item.productId?.price || 0;
                return sum + price * item.quantity;
            }, 0);

            return total;
        } catch (error) {
            console.error('Erro ao calcular total do carrinho:', error);
            throw error;
        }
    }

    async calculateCartTotals(cartId) {
        try {
            const cart = await Cart.findById(cartId).populate('products.productId');
            if (!cart) throw new Error('Carrinho não encontrado');

            const { totalQuantity, totalPrice } = cart.products.reduce(
                (acc, item) => {
                    const price = item.productId?.price || 0;
                    acc.totalQuantity += item.quantity;
                    acc.totalPrice += item.quantity * price;
                    return acc;
                },
                { totalQuantity: 0, totalPrice: 0 }
            );

            return { totalQuantity, totalPrice };
        } catch (error) {
            console.error('Erro ao calcular totais do carrinho:', error);
            throw error;
        }
    }

    async updateCartProductQuantity(cartId, productId, quantity) {
        try {
            const cart = await Cart.findById(cartId);
            if (!cart) throw new Error('Carrinho não encontrado');

            const item = cart.products.find(p => p.productId.toString() === productId);
            if (item) {
                item.quantity = quantity;
                await cart.save();
                return await cart.populate('products.productId');
            } else {
                return null;
            }
        } catch (error) {
            console.error('Erro ao atualizar quantidade do produto no carrinho:', error);
            throw error;
        }
    }
}

module.exports = CartRepository;
