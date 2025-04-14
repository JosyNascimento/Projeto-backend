// entregaParcial3/src/repositories/cart.repository.js
const Cart = require('../models/cart.model');
const Product = require('../models/product.model');

class CartRepository {
    async getCartById(id) {
        try {
            return await Cart.findById(id).populate('products.product');
        } catch (error) {
            console.error('Erro ao buscar carrinho por ID:', error);
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
            return await Cart.findByIdAndUpdate(id, cartData, { new: true }).populate('products.product');
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
            if (!cart) {
                throw new Error('Carrinho não encontrado');
            }

            const existingProduct = cart.products.find(p => p.product.toString() === productId);
            if (existingProduct) {
                existingProduct.quantity += quantity;
            } else {
                cart.products.push({ product: productId, quantity });
            }

            return await cart.save();
        } catch (error) {
            console.error('Erro ao adicionar produto ao carrinho:', error);
            throw error;
        }
    }

    async removeProductFromCart(cartId, productId) {
        try {
            const cart = await Cart.findById(cartId);
            if (!cart) {
                throw new Error('Carrinho não encontrado');
            }

            cart.products = cart.products.filter(p => p.product.toString() !== productId);
            return await cart.save();
        } catch (error) {
            console.error('Erro ao remover produto do carrinho:', error);
            throw error;
        }
    }

    async clearCart(cartId) {
        try {
            const cart = await Cart.findById(cartId);
            if (!cart) {
                throw new Error('Carrinho não encontrado');
            }

            cart.products = [];
            return await cart.save();
        } catch (error) {
            console.error('Erro ao limpar carrinho:', error);
            throw error;
        }
    }

    async getCartTotal(cartId) {
        try {
            const cart = await Cart.findById(cartId).populate('products.product');
            if (!cart) {
                throw new Error('Carrinho não encontrado');
            }

            let total = 0;
            for (const item of cart.products) {
                total += item.product.price * item.quantity;
            }
            return total;
        } catch (error) {
            console.error('Erro ao calcular total do carrinho:', error);
            throw error;
        }
    }

    async calculateCartTotals(cartId) {
        try {
            const cart = await Cart.findById(cartId).populate('products.product');
            if (!cart) {
                throw new Error('Carrinho não encontrado');
            }

            let totalQuantity = 0;
            let totalPrice = 0;
            for (const item of cart.products) {
                totalQuantity += item.quantity;
                totalPrice += item.product.price * item.quantity;
            }
            return { totalQuantity, totalPrice };
        } catch (error) {
            console.error('Erro ao calcular totais do carrinho:', error);
            throw error;
        }
    }

    async updateCartProductQuantity(cartId, productId, quantity) {
        try {
            const cart = await Cart.findById(cartId);
            if (!cart) {
                throw new Error('Carrinho não encontrado');
            }

            const itemIndex = cart.products.findIndex(item => item.product.toString() === productId);
            if (itemIndex > -1) {
                cart.products[itemIndex].quantity = quantity;
                await cart.save();
                return cart;
            } else {
                return null;
            }
        } catch (error) {
            console.error('Erro ao atualizar quantidade do produto no carrinho:', error);
            throw error;
        }
    }
}

module.exports =  CartRepository;