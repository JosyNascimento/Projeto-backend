// entregaFinal/src/controllers/cart.controller.js
const CartRepository = require("../repositories/cart.repository");
const cartRepository = new CartRepository();
const Cart = require("../models/cart.model");
const Product = require("../models/product.model");
const User = require("../models/user.model");

const createCart = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const { productId, quantity } = req.body;

    const newCart = await cartRepository.createCart({
      purchaserEmail: userEmail,
    });
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
    const cartId = req.params.cid || req.session.cartId;

    if (!cartId) {
      return res.render("cart", { cart: null, message: "Carrinho não encontrado" });
    }

    const fullCart = await Cart.findById(cartId)
      .populate("products.productId")
      .lean();

    if (!fullCart || !fullCart.products || fullCart.products.length === 0) {
     return res.render("cart", {
  cart: { _id: cartId, products: [] }, // Mantém estrutura para evitar erro no Handlebars
  totalQuantity: 0,
  totalPrice: 0,
  message: "Seu carrinho está vazio.",
});
    }

    res.render("cart", {
      cart: fullCart,
      totalQuantity: calcularTotalQuantidade(fullCart.products),
      totalPrice: calcularTotalPreco(fullCart.products),
    });
  } catch (error) {
    console.error("Erro ao buscar carrinho:", error);
    res.status(500).send("Erro no servidor");
  }
};

const calcularTotalPreco = (products) => {
  return products.reduce(
    (total, item) => total + item.productId.price * item.quantity,
    0
  );
};

const updateCartProductQuantity = async (req, res) => {
  const { cid, pid } = req.params;
  const { quantity } = req.body;
  try {
    const updatedCart = await cartRepository.updateCartProductQuantity(
      cid,
      pid,
      quantity
    );
    if (!updatedCart) {
      return res
        .status(404)
        .json({ message: "Produto não encontrado no carrinho!" });
    }
    res
      .status(200)
      .json({
        status: "success",
        message: "Quantidade atualizada!",
        cart: updatedCart,
      });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

const clearCart = async (req, res) => {
    const { cid } = req.params;
    try {
        await cartRepository.clearCart(cid);
        req.session.cart = { products: [] }; // Limpar também a sessão para não logados
        res.redirect('/cart');
    } catch (error) {
        console.error('Erro ao limpar carrinho:', error);
        res.status(500).send('Erro ao limpar o carrinho.');
    }
};

const addProductToCartByCartId= async (req, res) => {
  try {
    let cartId = req.session.cartId;
    const { productId } = req.params;
    const { quantity = 1 } = req.body;

    // Verifica se já existe carrinho na sessão
    let cart;
    if (cartId) {
      cart = await Cart.findById(cartId);
    }

    // Se não existir carrinho ou carrinho inválido, cria um novo
    if (!cart) {
      const purchaserEmail = req.user?.email || "guest";
      const newCart = await cartRepository.createCart({ purchaserEmail });
      cart = newCart;
      req.session.cartId = newCart._id.toString();
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res
        .status(404)
        .json({ status: "error", message: "Produto não encontrado." });
    }

    if (quantity > product.stock) {
      return res
        .status(400)
        .json({ message: "Quantidade solicitada excede o estoque disponível" });
    }

    const existingProduct = cart.products.find(
      (p) => p.productId && p.productId.equals(productId)
    );

    if (existingProduct) {
      existingProduct.quantity += Number(quantity);
    } else {
      cart.products.push({ productId: productId, quantity: Number(quantity) });
    }

    await cart.save();
    return res.json({
      status: "success",
      message: "Produto adicionado ao carrinho!",
    });
  } catch (error) {
    console.error("Erro ao adicionar produto ao carrinho:", error);
    return res.status(500).json({
      status: "error",
      message: `Erro ao adicionar produto ao carrinho: ${error.message}`,
    });
  }
};

const removeProductFromCart = async (req, res) => {
  const { cid, pid } = req.params;

  try {
    const cart = await Cart.findById(cid);

    if (!cart) {
      return res.status(404).json({ message: "Carrinho não encontrado" });
    }

    cart.products = cart.products.filter((item) => {
      const itemProductId =
        typeof item.product === "object" && item.product !== null
          ? item.product._id.toString()
          : item.product.toString();

      return itemProductId !== pid;
    });

    await cart.save();

    return res
      .status(200)
      .json({ message: "Produto removido do carrinho com sucesso" });
  } catch (error) {
    console.error("Erro ao remover produto do carrinho:", error);
    return res
      .status(500)
      .json({ message: "Erro inesperado ao remover o produto do carrinho" });
  }
};

module.exports = {
  addProductToCartByCartId,
  createCart,
  getCartById,
  updateCartProductQuantity,
  clearCart,
  removeProductFromCart,
};
