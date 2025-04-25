// checkout.controller.js
const stripe = require('../config/stripe.config');
const TicketModel = require('../models/ticket.model');
const Cart = require('../models/cart.model');


const createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency = "brl" } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount, // em centavos: R$10 = 1000
      currency,
      automatic_payment_methods: { enabled: true },
    });

    res.send({
      clientSecret: paymentIntent.client_secret
    });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Erro ao criar PaymentIntent" });
  }
};

exports.paymentSuccess = async (req, res) => {
    try {
      const user = req.user; // assumindo que esteja autenticado
      const cart = await CartService.getCartByUserId(user._id);
  
      // calcular total, gerar número de ticket, etc.
      const total = cart.products.reduce((sum, item) => {
        return sum + item.product.price * item.quantity;
      }, 0);
  
      const ticket = await TicketModel.create({
        code: 'TCK-' + Date.now(),
        purchase_datetime: new Date().toLocaleString('pt-BR'),
        amount: total,
        purchaser: user.email,
        products: cart.products
      });
  
      // esvazia carrinho
      await CartService.clearCart(cart._id);
  
      res.render('checkoutSuccess', { ticket });
    } catch (err) {
      console.error('Erro ao criar ticket:', err.message);
      res.status(500).send('Erro ao processar pagamento');
    }
  };

  async function checkout(req, res) {
    const cartId = req.session.cartId; // ou outra lógica de como o carrinho é armazenado
    const cart = await Cart.findById(cartId).populate('products.product');
  
    if (!cart) {
      return res.redirect('/cart'); // Caso o carrinho não exista
    }
  
    // Crie um ticket para o pedido
    const ticket = new Ticket({
      cart: cartId,
      products: cart.products,
      amount: cart.totalPrice,
      purchase_datetime: new Date()
    });
  
    await ticket.save();
  
    res.render('checkoutSuccess', { ticket });
  }
module.exports = { createPaymentIntent, checkout };