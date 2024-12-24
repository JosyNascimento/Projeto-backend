// routes/cart.js
const express = require('express');
const CartManager = require('../CartManager');
const router = express.Router();
const cartManager = new CartManager();
const cart = await Cart.findOne({ userId: req.user.id }); // Exemplo de busca por ID de usuário
(async () => {
  await cartManager.loadCarts();
  await cartManager.loadProducts();  // Carregar os produtos também
})();
// Criar um novo carrinho
router.post('/', async (req, res) => {
  try {
    const newCart = await cartManager.createCart();
    return res.status(201).json(newCart);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});
// Buscar carrinho por ID
router.get('/:cid', async (req, res) => {
  const cid = Number(req.params.cid);
  try {
    const cart = await cartManager.getCartById(cid);
    if (!cart) {
      return res.status(404).json({ error: 'Carrinho não encontrado' });
    }
    const total = await cartManager.getCartTotal(cid);  // Calculando o total do carrinho
    return res.json({ cart, total });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});
// Adicionar produto ao carrinho
// Rota POST para adicionar produto ao carrinho
router.post('/cart', async (req, res) => {
  const { productId, quantity } = req.body;

  try {
    // Verifica se o produto existe no banco
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).send('Produto não encontrado');
    }

    // Verifica se já existe um carrinho
    let cart = await Cart.findOne({ userId: req.session.userId }); // Exemplo, assumindo que você tenha um sistema de sessão

    if (!cart) {
      // Se não houver carrinho, cria um novo
      cart = new Cart({
        userId: req.session.userId, // Assumindo que você tem o ID do usuário na sessão
        items: [{ productId: product._id, quantity: parseInt(quantity) }]
      });
      await cart.save();
    } else {
      // Se já houver carrinho, verifica se o produto já está presente
      const existingItemIndex = cart.items.findIndex(item => item.productId.toString() === product._id.toString());

      if (existingItemIndex === -1) {
        // Se o produto não estiver no carrinho, adiciona um novo item
        cart.items.push({ productId: product._id, quantity: parseInt(quantity) });
      } else {
        // Se o produto já estiver no carrinho, apenas atualiza a quantidade
        cart.items[existingItemIndex].quantity += parseInt(quantity);
      }

      await cart.save();
    }

    res.redirect('/cart'); // Redireciona para a página do carrinho
  } catch (error) {
    console.error('Erro ao adicionar ao carrinho:', error);
    res.status(500).send('Erro ao adicionar ao carrinho');
  }
});

// Rota para exibir o carrinho
router.get("/", async (req, res) => {
  try {
    const cart = await Cart.findOne();  // Encontrar o carrinho (ajuste conforme seu modelo)
    if (!cart) {
      return res.render("cart", { message: "Carrinho não encontrado" });
    }
    // Calcular o total
    let totalPrice = 0;
    cart.items.forEach(item => {
      totalPrice += item.quantity * item.productId.price;  // Ajuste aqui conforme seu modelo
    });
    // Renderizar a página do carrinho, passando o totalPrice
    res.render("cart", { title: "Carrinho de Compras", cart, totalPrice });
  } catch (error) {
    console.error('Erro ao carregar o carrinho:', error);
    res.status(500).json({ message: 'Erro ao carregar o carrinho', error: error.message });
  }
});
module.exports = router;