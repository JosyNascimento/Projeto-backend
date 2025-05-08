// entregaFinal/src/controllers/cart.controller.js
const CartRepository = require('../repositories/cart.repository');
const cartRepository = new CartRepository()
const Cart = require('../models/cart.model');
const Product = require('../models/product.model');
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
// Exemplo de controller getCartById
const getCartById = async (req, res) => {
    try {
        const { cid } = req.params;
        const cart = await Cart.findById(cid).populate('products.productId'); 
        console.log('Dados do carrinho:', cart);
        if (!cart) return res.status(404).send("Carrinho não encontrado");

        // Calcula o total
        let total = 0;
        let totalQuantity = 0;
        for (const item of cart.products) {
            total += item.product.price * item.quantity;
            totalQuantity += item.quantity;
        }

        res.render("cart", { // Renderiza a view "cart"
            cart: cart.products,
            totalPrice: total,
            totalQuantity: totalQuantity
        });
    } catch (error) {
        console.error("Erro ao buscar carrinho:", error);
        res.status(500).send("Erro no servidor");
    }
};

// Exibe os produtos do carrinho (você pode manter esta função se tiver outra rota que a utiliza)
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
        const totalQuantity = cart.products.reduce((total, item) => total + item.quantity, 0);

        res.render('carts', { cart, totalPrice, totalQuantity });
    } catch (error) {
        console.error('Erro ao carregar o carrinho:', error);
        res.status(500).send('Erro ao carregar o carrinho');
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
    const { quantity = 1, price } = req.body;

    try {
        console.log("Recebendo solicitação para adicionar produto ao carrinho:");
        console.log("CartId:", cartId, "ProductId:", productId, " price:", price);

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
        const existingProduct = cart.products.find(p => p.product && p.product.equals(productId)); // Alterado para comparar ObjectIds corretamente

        if (existingProduct) {
            console.log("Produto já existe no carrinho. Atualizando quantidade.");
            existingProduct.quantity += Number(quantity);
        } else {
            console.log("Produto não existe no carrinho. Adicionando novo produto.");
            cart.products.push({ product: productId, quantity: Number(quantity) }); // Não precisa do preço aqui, pois ele será populado na view
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

async function addToCart(productId, quantity = 1) {
    try {
        const response = await fetch(`/api/carts/me/product/${productId}`, { // Adapte a sua rota
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ quantity }),
        });

        if (response.ok) {
            const cartData = await response.json(); // Espera que o backend retorne os dados do carrinho
            const totalQuantity = cartData.totalQuantity; // Assumindo que o backend retorna a quantidade total

            const cartQuantityElement = document.getElementById('cart-quantity');
            if (cartQuantityElement) {
                cartQuantityElement.textContent = totalQuantity;
            }
            // Opcional: Mostrar uma mensagem de sucesso ao usuário
            console.log('Produto adicionado ao carrinho!');
        } else {
            const error = await response.json();
            alert('Erro ao adicionar ao carrinho: ' + error.message);
        }
    } catch (error) {
        console.error('Erro ao adicionar ao carrinho:', error);
        alert('Erro inesperado ao adicionar ao carrinho.');
    }
}

const removeProductFromCart = async (req, res) => {
    const { cid, pid } = req.params;

    try {
        const cart = await Cart.findById(cid);

        if (!cart) {
            return res.status(404).json({ message: 'Carrinho não encontrado' });
        }

        // Remove o produto do array de produtos do carrinho
        cart.products = cart.products.filter(item => item.product.toString() !== pid);

        // Salva o carrinho atualizado
        await cart.save();

        return res.status(200).json({ message: 'Produto removido do carrinho com sucesso' });

    } catch (error) {
        console.error('Erro ao remover produto do carrinho:', error);
        return res.status(500).json({ message: 'Erro ao remover produto do carrinho' });
    }
};

const checkout = async (req, res) => {
    const { cartId } = req.params;

    try {
        const cart = await Cart.findById(cartId).populate('products.productId');
        if (!cart) {
            return res.status(404).json({ status: 'error', message: 'Carrinho não encontrado.' });
        }

        // Calcular o total do carrinho
        const totalPrice = cart.products.reduce((total, item) => total + (item.productId.price * item.quantity), 0);

        // Passar o totalPrice para a view
        res.render('checkout', { cart, totalPrice });
    } catch (error) {
        console.error("Erro ao carregar página de checkout:", error);
        res.status(500).json({ status: 'error', message: 'Erro ao carregar os detalhes da compra.' });
    }
};



const checkoutSuccess = async (req, res) => {
    const { cartId } = req.params;

    try {
        const cart = await Cart.findById(cartId).populate('products.productId'); // Popule os produtos para exibir detalhes

        if (!cart) {
            return res.status(404).send("Carrinho não encontrado.");
        }

        // Calcule o total novamente para a página de sucesso (opcional, pode já ter feito isso)
        const totalPrice = cart.products.reduce((total, item) => total + item.quantity * item.productId.price, 0);

        res.redirect('/purchase-success');
    } catch (error) {
        res.status(500).send("Erro no pagamento.");
    }
};

module.exports = {
    addProductToCartByCartId,
    createCart,
    getCartById,
    getCart,
    updateCartProductQuantity,
    clearCart,
    removeProductFromCart,
    checkout,
    checkoutSuccess,
    addToCart,
};