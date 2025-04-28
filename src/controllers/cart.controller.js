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
// Exibe os produtos do carrinho
const getCart = async (req, res) => {
    const { cartId } = req.params;
  
    try {
      const cart = await Cart.findById(cartId).populate('products.product');
      if (!cart) {
        return res.status(404).send('Carrinho não encontrado');
      }
  
      // Calcula o valor total
      const totalPrice = cart.products.reduce((total, item) => {
        return total + item.product.price * item.quantity;
      }, 0);
  
      res.render('carts', { cart, totalPrice });
    } catch (error) {
      console.error('Erro ao carregar o carrinho:', error);
      res.status(500).send('Erro ao carregar o carrinho');
    }
  };
  
// Adiciona um produto ao carrinho
const addProductToCart = async (req, res) => {
    const { cartId, productId } = req.params;
    const { quantity } = req.body;

    try {
        // Encontre o carrinho pelo ID
        const cart = await Cart.findById(cartId);

        if (!cart) {
            return res.status(404).json({ message: 'Carrinho não encontrado' });
        }

        // Encontre o produto
        const product = await Product.findById(productId);  // Certifique-se de que o modelo Product está importado

        if (!product) {
            return res.status(404).json({ message: 'Produto não encontrado' });
        }
if (!quantity || quantity <= 0) {
    return res.status(400).json({ message: 'Quantidade inválida' });
}

        // Verifica se o produto já existe no carrinho
        const existingProduct = cart.products.find(p => p.product.toString() === productId);

        if (existingProduct) {
            // Se já estiver no carrinho, incrementa a quantidade
            existingProduct.quantity += quantity;
        } else {
            // Se não estiver, adiciona um novo produto
            cart.products.push({ product: productId, quantity });
        }

        // Salvar o carrinho atualizado
        await cart.save();

        return res.status(200).json({ message: 'Produto adicionado ao carrinho' });
    } catch (error) {
        console.error('Erro ao adicionar produto ao carrinho:', error);
        return res.status(500).json({ message: 'Erro ao adicionar produto ao carrinho' });
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

const renderCart = async (req, res) => {
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
        console.log("Recebendo solicitação para adicionar produto ao carrinho:");
        console.log("CartId:", cartId, "ProductId:", productId, "Quantity:", quantity);

        const cart = await Cart.findById(cartId);
        if (!cart) {
            console.log("Carrinho não encontrado");
            return res.status(404).json({ status: 'error', message: 'Carrinho não encontrado.' });
        }

        console.log("Carrinho encontrado:", cart);

        const product = await Product.findById(productId);
        if (!product) {
            console.log("Produto não encontrado");
            return res.status(404).json({ status: 'error', message: 'Produto não encontrado.' });
        }

        console.log("Produto encontrado:", product);

        // Verificar estoque
        if (quantity > product.stock) {
            console.log("Quantidade solicitada excede o estoque disponível");
            return res.status(400).json({ message: 'Quantidade solicitada excede o estoque disponível' });
        }

        // Verifica se o produto já está no carrinho
        const existingProduct = cart.products.find(p => p.product.toString() === productId);
        if (existingProduct) {
            console.log("Produto já existe no carrinho. Atualizando quantidade.");
            existingProduct.quantity += Number(quantity);
        } else {
            console.log("Produto não existe no carrinho. Adicionando novo produto.");
            cart.products.push({ product: productId, quantity: Number(quantity) });
        }

        // Salva o carrinho atualizado
        await cart.save();
        console.log("Carrinho atualizado:", cart);

        return res.json({ status: 'success', message: 'Produto adicionado ao carrinho!' });

    } catch (error) {
        console.error("Erro ao adicionar produto ao carrinho:", error);
        return res.status(500).json({ status: 'error', message: `Erro ao adicionar produto ao carrinho: ${error.message}` });
    }
};



module.exports = {
    addProductToCartByCartId,
    createCart,
    getCartById,
    getCart,
    renderCart,
    addProductToCart,
    updateCartProductQuantity,
    displayCart,
    clearCart,
};