// entregaParcial3/src/controllers/cart.controller.js
const CartRepository = require('../repositories/cart.repository');
const cartRepository = new CartRepository()
const Cart = require('../models/cart.model');
const User = require('../models/user.model');
const Product = require("../models/product.model");
const mongoose = require('mongoose');

const createCart = async (req, res) => {
  try {
    const userId = req.user._id;

    // Verifica se já existe um carrinho para o usuário
    let cart = await cartRepository.getCartByUserId(userId);
    if (cart) {
      return res.status(400).json({ message: "Usuário já possui um carrinho." });
    }

    // Cria novo carrinho com userId
    cart = await cartRepository.createCart({ userId, products: [] });

    return res.status(201).json({ status: "success", payload: cart });
  } catch (err) {
    console.error("Erro ao criar carrinho:", err);
    return res.status(500).json({ status: "error", message: "Erro ao criar carrinho" });
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
const getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.body.userId }).populate(
            'products.productId'
        );

        if (!cart) {
            return res.status(404).json({ message: 'Carrinho não encontrado' });
        }

        return res.status(200).json(cart);
    } catch (error) {
        console.error('Erro ao buscar carrinho:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
};
const addProductToCart = async (req, res) => {
    const { pid } = req.params;
    const userId = req.user?._id;

    if (!userId) {
        return res.status(401).json({ status: 'error', message: 'Usuário não autenticado' });
    }

    let user = await User.findById(userId);

    // Cria carrinho se não existir
    if (!user.cart) {
        const newCart = await Cart.create({ products: [] });
        user.cart = newCart._id;
        await user.save();
    }

    const cart = await Cart.findById(user.cart);
    if (!cart) {
        return res.status(404).json({ status: 'error', message: 'Carrinho não encontrado' });
    }

    // Lógica para adicionar produto
    const existingProduct = cart.products.find(p => p.product.toString() === pid);

    if (existingProduct) {
        existingProduct.quantity += 1;
    } else {
        cart.products.push({ product: pid, quantity: 1 });
    }

    await cart.save();

    return res.json({ status: 'success', message: 'Produto adicionado ao carrinho!' });
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

const renderCarts = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/login');
        }

        const userId = req.session.user.id;
        const cart = await cartRepository.getCartByUserId(userId);

        if (cart) {
            const { totalQuantity, totalPrice } = await cartRepository.calculateCartTotals(cart._id);
            console.log("Dados do carrinho:", cart, totalQuantity, totalPrice); // Adicione este log
            res.render('cart', { title: 'Carrinho', cart, totalQuantity, totalPrice });
        } else {
            console.log("Carrinho vazio"); // Adicione este log
            res.render('cart', { title: 'Carrinho', cart: { products: [] }, totalQuantity: 0, totalPrice: 0 });
        }
    } catch (error) {
        console.error('Erro ao renderizar carrinho:', error);
        res.status(500).send('Erro ao carregar carrinho');
    }
};

const addProductToCartByCartId= async (req, res) => {
    console.log('>>> Entrou no addProductToCartByCartId no controller!');
    try {
        let cartId = req.session.cartId; // Pega da sessão primeiro (se existir)
        const { productId } = req.params;
        const { quantity = 1 } = req.body;

        console.log(`Debug: cartId da sessão: ${req.session.cartId}`);
        console.log(`Debug: productId dos params: ${productId}`);
        console.log(`Debug: quantity do body: ${quantity}`);

        // Se o cartId veio dos params da rota (como é o caso aqui), priorize-o
        if (req.params.cid) {
            cartId = req.params.cid;
            console.log(`Debug: cartId dos params (${req.params.cid}) priorizado.`);
        }

        let existingCartId;
        if (cartId && mongoose.Types.ObjectId.isValid(cartId)) {
            existingCartId = new mongoose.Types.ObjectId(cartId);
            console.log(`Debug: cartId validado e convertido para ObjectId: ${existingCartId}`);
        } else {
            console.log(`Debug: cartId inválido ou nulo: ${cartId}. Será tratado como novo carrinho.`);
            existingCartId = null;
        }

        let cart;
        if (existingCartId) {
            cart = await Cart.findById(existingCartId);
            console.log(`Debug: Carrinho encontrado via findById: ${cart ? cart._id : 'Nenhum'}`);
        }

        if (!cart) {
            console.log('Debug: Carrinho não encontrado. Criando novo carrinho.');
            const purchaserEmail = req.user?.email || "guest";
            const newCart = await cartRepository.createCart({ purchaserEmail });
            cart = newCart;
            req.session.cartId = newCart._id.toString(); // Atualiza a sessão com o ID do novo carrinho
            console.log(`Debug: Novo carrinho criado com ID: ${cart._id}. Sessão atualizada.`);
        }
    
        const product = await Product.findById(productId);
      
        console.log(`Debug: Produto encontrado: ${product ? product.title : 'Nenhum'}`);


        if (!product) {
            console.log(`Erro: Produto com ID ${productId} não encontrado no banco de dados.`);
            return res.status(404).json({ status: "error", message: "Produto não encontrado." });
        }

        if (quantity > product.stock) {
            console.log(`Erro: Quantidade solicitada (${quantity}) excede o estoque disponível (${product.stock}).`);
            return res.status(400).json({ message: "Quantidade solicitada excede o estoque disponível" });
        }

        const existingProductInCart = cart.products.find(
            (p) => p.productId && p.productId.equals(productId)
        );

        if (existingProductInCart) {
            existingProductInCart.quantity += Number(quantity);
            console.log(`Debug: Quantidade do produto existente no carrinho atualizada para ${existingProductInCart.quantity}.`);
        } else {
            cart.products.push({ productId: productId, quantity: Number(quantity) });
            console.log(`Debug: Novo produto (${productId}) adicionado ao carrinho.`);
        }

        await cart.save();
        console.log('Debug: Carrinho salvo com sucesso.');

        return res.json({
            status: "success",
            message: "Produto adicionado ao carrinho!",
            cartId: cart._id,
            totalQuantity: cart.products.reduce((acc, item) => acc + item.quantity, 0)
        });
    } catch (error) {
        console.error("🔥 ERRO CRÍTICO ao adicionar produto ao carrinho:", error);
        return res.status(500).json({
            status: "error",
            message: `Erro ao adicionar produto ao carrinho: ${error.message}`,
        });
    }
};

const removeProductFromCart = async (req, res) => {
    console.log('>>> removeProductFromCart no controller foi chamado!');
    const { cid, productId } = req.params;

console.log(`DEBUG_CONTROLLER: Tentando remover produto ${productId} do carrinho ${cid}`); 

    try {
        const cart = await Cart.findById(cid);
        if (!cart) {
            return res.status(404).json({ status: 'error', message: 'Carrinho não encontrado.' });
        }

        const productIndex = cart.products.findIndex(p => p.productId && p.productId.toString() === productId);

       if (productIndex === -1) {
            console.log(`DEBUG_CONTROLLER: Produto ${productId} não encontrado no carrinho ${cid}.`);
            return res.status(404).json({ status: 'error', message: 'Produto não encontrado no carrinho.' });
        }

        cart.products.splice(productIndex, 1);
        await cart.save();

       console.log(`DEBUG_CONTROLLER: Produto ${productId} removido com sucesso do carrinho ${cid}.`);
        return res.json({ status: 'success', message: 'Produto removido do carrinho!' });
    } catch (error) {
        console.error("🔥🔥🔥 ERRO CRÍTICO no controller removeProductFromCart:", error); // Log mais chamativo para erros
        return res.status(500).json({ status: 'error', message: 'Erro inesperado ao excluir produto do carrinho.' });
    }
};

module.exports = {
    addProductToCartByCartId,
    createCart,
    getCartById,
    getCart,
    renderCarts,
    addProductToCart,
    updateCartProductQuantity,
    displayCart,
    clearCart,
    removeProductFromCart,
};