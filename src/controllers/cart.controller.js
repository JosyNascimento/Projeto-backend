// entregaParcial3/src/controllers/cart.controller.js
const CartRepository = require('../repositories/cart.repository');
const cartRepository = new CartRepository()
const Cart = require('../models/cart.model');
const User = require('../models/user.model');
const createCart = async (req, res) => {
    try {
        const userEmail = req.user.email; // Exemplo de e-mail enviado na requisição
        const { productId, quantity } = req.body;

        const newCart = await cartRepository.createCart({ purchaserEmail: userEmail });

        req.session.cartId = newCart._id

        if (productId && quantity) {
            await cartRepository.addProductToCart(newCart._id, productId, quantity);
        }
        return res.status(201).json(newCart);
    } 
    catch (error) {
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

const addProductToCartByCartId = async (req, res) => {
    const { cartId, productId } = req.params;
    const { quantity = 1 } = req.body;

    try {
        const cart = await Cart.findById(cartId);
        if (!cart) {
            return res.status(404).json({ status: 'error', message: 'Carrinho não encontrado.' });
        }

        // Verifica se o produto já está no carrinho
        const existingProduct = cart.products.find(p => p.product.toString() === productId);

        if (existingProduct) {
            // Se já estiver no carrinho, incrementa a quantidade
            existingProduct.quantity += Number(quantity);
        } else {
            // Se não estiver, adiciona um novo produto
            cart.products.push({ product: productId, quantity: Number(quantity) });
        }

        // Salva o carrinho atualizado
        await cart.save();

        return res.json({ status: 'success', message: 'Produto adicionado ao carrinho!' });

    } catch (error) {
        return res.status(500).json({ status: 'error', message: 'Erro ao adicionar produto ao carrinho.' });
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
};