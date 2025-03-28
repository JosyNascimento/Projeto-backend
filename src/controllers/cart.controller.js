const Cart = require('../models/Cart');
const Product = require('../models/Product');

const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.id;

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({ user: userId, items: [{ product: productId, quantity: quantity }] });
    } else {
      const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += parseInt(quantity);
      } else {
        cart.items.push({ product: productId, quantity: quantity });
      }
    }

    await cart.save();
    res.redirect('/cart');
  } catch (error) {
    res.status(500).send('Erro ao adicionar produto ao carrinho');
  }
};

const getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = req.user;
    let cart = await Cart.findOne({ user: userId }).populate('items.product');
    const isAdminOrPremium = user && (user.role === 'admin' || user.role === 'premium');

    if (!cart) {
      return res.render('cart', { cart: null, title: 'Carrinho', user, isAdminOrPremium });
    }

    // Verifica se os produtos ainda existem
    const validItems = [];
    for (const item of cart.items) {
      if (item.product) { // Adiciona esta verificação
        const product = await Product.findById(item.product._id);
        if (product) {
          validItems.push(item);
        }
      }
    }

    cart.items = validItems;
    await cart.save();
    res.render('cart', { cart, title: 'Carrinho', user, isAdminOrPremium });
  } catch (error) {
    console.log(error);
    res.status(500).send('Erro ao buscar carrinho');
  }
};


const updateQuantity = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.id;

    await Cart.findOneAndUpdate(
      { user: userId, 'items.product': productId },
      { $set: { 'items.$.quantity': quantity } }
    );

    res.redirect('/cart');
  } catch (error) {
    res.status(500).send('Erro ao atualizar quantidade do item');
  }
};

const removeItem = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id;

    await Cart.findOneAndUpdate(
      { user: userId },
      { $pull: { items: { product: productId } } }
    );

    res.redirect('/cart');
  } catch (error) {
    res.status(500).send('Erro ao remover item do carrinho');
  }
};

module.exports = { addToCart, getCart, updateQuantity, removeItem };


/* entregaParcial3/src/controllers/cart.controller.js
const Cart = require("../models/cart.model");
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
};*