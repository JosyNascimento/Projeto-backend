// entregaFinal/src/controllers/cart.controller.js
const CartRepository = require('../repositories/cart.repository');
const cartRepository = new CartRepository();
const Cart = require('../models/cart.model');
const Product = require('../models/product.model');
const User = require('../models/user.model');

const createCart = async (req, res) => {
    try {
        const userEmail = req.user.email;
        const { productId, quantity } = req.body;

        const newCart = await cartRepository.createCart({ purchaserEmail: userEmail });
        req.session.cartId = newCart._id;

        if (productId && quantity) {
            await cartRepository.addProductToCart(newCart._id, productId, quantity);
        }

        return res.status(201).json(newCart);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};


    const getCartById = async (req, res) => {
        try {
            const cartId = req.params.cid;
    
            const fullCart = await Cart.findById(cartId)
                .populate('products.productId')
                .lean();
    
            if (!fullCart) {
                return res.status(404).send("Carrinho não encontrado!");
            }
    
            res.render('cart', {
                cart: fullCart,
                totalQuantity: calcularTotalQuantidade(fullCart.products),
                totalPrice: calcularTotalPreco(fullCart.products),
            });
        } catch (error) {
            console.error("Erro ao buscar carrinho:", error);
            res.status(500).send("Erro no servidor");
        }
    };
    
    const calcularTotalQuantidade = (products) => {
        return products.reduce((total, item) => total + item.quantity, 0);
    };
    
    const calcularTotalPreco = (products) => {
        return products.reduce((total, item) => total + item.productId.price * item.quantity, 0);
    };

const updateCartProductQuantity = async (req, res) => {
    const { cid, pid } = req.params;
    const { quantity } = req.body;
    try {
        const updatedCart = await cartRepository.updateCartProductQuantity(cid, pid, quantity);
        if (!updatedCart) {
            return res.status(404).json({ message: "Produto não encontrado no carrinho!" });
        }
        res.status(200).json({ status: "success", message: "Quantidade atualizada!", cart: updatedCart });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

const clearCart = async (req, res) => {
    try {
        const result = await cartRepository.clearCart(req.params.cid);
        if (!result) {
            return res.status(404).json({ status: "error", message: "Carrinho não encontrado." });
        }
        res.status(200).json({ status: "success", message: "Carrinho limpo com sucesso!" });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

const addProductToCartByCartId = async (req, res) => {
    const { cartId, productId } = req.params;
    const { quantity = 1 } = req.body;

    try {
        const cart = await Cart.findById(cartId);
        if (!cart) {
            return res.status(404).json({ status: 'error', message: 'Carrinho não encontrado.' });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ status: 'error', message: 'Produto não encontrado.' });
        }

        if (quantity > product.stock) {
            return res.status(400).json({ message: 'Quantidade solicitada excede o estoque disponível' });
        }

        const existingProduct = cart.products.find(p => p.productId && p.productId.equals(productId));

if (existingProduct) {
    existingProduct.quantity += Number(quantity);
} else {
    cart.products.push({ productId: productId, quantity: Number(quantity) });
}

        await cart.save();
        return res.json({ status: 'success', message: 'Produto adicionado ao carrinho!' });

    } catch (error) {
        console.error("Erro ao adicionar produto ao carrinho:", error);
        return res.status(500).json({ status: 'error', message: `Erro ao adicionar produto ao carrinho: ${error.message}` });
    }
};

const removeProductFromCart = async (req, res) => {
    const { cid, pid } = req.params;

    try {
        const cart = await Cart.findById(cid);

        if (!cart) {
            return res.status(404).json({ message: 'Carrinho não encontrado' });
        }

        cart.products = cart.products.filter(item => {
            const itemProductId =
                typeof item.product === 'object' && item.product !== null
                    ? item.product._id.toString()
                    : item.product.toString();

            return itemProductId !== pid;
        });

        await cart.save();

        return res.status(200).json({ message: 'Produto removido do carrinho com sucesso' });

    } catch (error) {
        console.error('Erro ao remover produto do carrinho:', error);
        return res.status(500).json({ message: 'Erro inesperado ao remover o produto do carrinho' });
    }
};

const checkout = async (req, res) => {
    const { cartId } = req.params;

    try {
        const cart = await Cart.findById(cartId).populate('products.product');
        if (!cart) {
            return res.status(404).json({ status: 'error', message: 'Carrinho não encontrado.' });
        }

        const totalPrice = cart.products.reduce((total, item) => total + (item.product.price * item.quantity), 0);

        res.render('checkout', { cart, totalPrice });
    } catch (error) {
        console.error("Erro ao carregar página de checkout:", error);
        res.status(500).json({ status: 'error', message: 'Erro ao carregar os detalhes da compra.' });
    }
};

const checkoutSuccess = async (req, res) => {
    const { cartId } = req.params;

    try {
        const cart = await Cart.findById(cartId).populate('products.productId');

        if (!cart) {
            return res.status(404).send("Carrinho não encontrado.");
        }

        res.redirect('/purchase-success');
    } catch (error) {
        res.status(500).send("Erro no pagamento.");
    }
};


module.exports = {
    addProductToCartByCartId,
    createCart,
    getCartById,
    updateCartProductQuantity,
    clearCart,
    removeProductFromCart,
    checkout,
    checkoutSuccess,
};
