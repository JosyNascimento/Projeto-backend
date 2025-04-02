//entregaParcial3/src/controllers/cart.controller.js

const Product = require("../models/product.model");
const cartRepository = require('../repositories/cart.repository');

const createCart = async (req, res) => {
    try {
        const userEmail = req.body.email;  // Exemplo de e-mail enviado na requisição
        const newCart = await cartRepository.createCart({ purchaserEmail: userEmail });
        return res.status(201).json(newCart);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const getCartById = async (req, res) => {
    try {
        const cart = await cartRepository.getCartById(req.params.cid);
        if (!cart) return res.status(404).json({ error: "Carrinho não encontrado" });

        const total = await cartRepository.getCartTotal(req.params.cid); // Calcula o total no repository
        return res.json({ cart, total });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const addProductToCart = async (req, res) => {
    const { productId, quantity } = req.body;
    try {
        await cartRepository.addProductToCart(req.session.cartId, productId, quantity);
        res.redirect("/cart");
    } catch (error) {
        console.error("Erro ao adicionar ao carrinho:", error);
        res.status(500).send("Erro ao adicionar ao carrinho");
    }
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

const displayCart = async (req, res) => {
    try {
        const cart = await cartRepository.getCartById(req.session.cartId);
        if (!cart) {
            return res.render("cart", { title: "Carrinho", cart: { items: [] }, totalQuantity: 0, totalPrice: 0 });
        }
        const { totalQuantity, totalPrice } = await cartRepository.calculateCartTotals(req.session.cartId);
        res.render("cart", { title: "Carrinho", cart, totalQuantity, totalPrice });
    } catch (error) {
        console.error("Erro ao carregar o carrinho:", error);
        res.status(500).send("Erro ao carregar o carrinho.");
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


module.exports = {
    createCart,
    getCartById,
    addProductToCart,
    updateCartProductQuantity,
    displayCart,
    clearCart,
};