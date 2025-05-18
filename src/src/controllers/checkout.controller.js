// checkout.controller.js
const stripe = require('../config/stripe.config');
const TicketModel = require('../models/ticket.model');
const Cart = require('../models/cart.model');
const OrderModel = require('../models/order.model'); // Assumindo que você tem um model de Pedido
const { v4: uuidv4 } = require('uuid'); // Para gerar IDs únicos de pedido

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

const paymentSuccess = async (req, res) => {
  try {
    const user = req.user; // assumindo que esteja autenticado
    // const cart = await CartService.getCartByUserId(user._id); // Use seu serviço ou repository para buscar o carrinho
    const cart = await Cart.findOne({ purchaserEmail: user.email }).populate('products.product'); // Exemplo direto com o model

    if (!cart) {
      return res.redirect('/cart'); // Redireciona se o carrinho não for encontrado
    }

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
      await Cart.findByIdAndUpdate(cart._id, { products: [] });
  
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
  
    // Calcule o preço total do carrinho aqui, se necessário
  let totalPrice = 0;
  if (cart.products && cart.products.length > 0) {
    totalPrice = cart.products.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    cart.totalPrice = totalPrice;
    await cart.save(); // Salve o preço total no carrinho, se desejar
  }
    res.render('checkoutSuccess', { ticket });
  }

  

const processCheckout = async (req, res) => {
  try {
    const { paymentMethod, shippingAddress } = req.body;
    const cartId = req.session.cartId;
    const user = req.user; // Assumindo que o usuário está autenticado

    const cart = await Cart.findById(cartId).populate('products.product');

    if (!cart || cart.products.length === 0) {
      return res.redirect('/cart'); // Redireciona se o carrinho estiver vazio
    }

    // 1. Calcular o valor total do pedido
    const totalAmount = cart.products.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    // 2. Gerar um ID único para o pedido
    const orderId = uuidv4();

    // 3. Criar o pedido no banco de dados
    const newOrder = new OrderModel({
      orderId: uuidv4(),
      userId: user._id,
      items: cart.products.map(item => ({
        productId: item.product._id,
        name: item.product.title,
        quantity: item.quantity,
        price: item.product.price,
      })),
      totalAmount: totalAmount,
      shippingAddress: shippingAddress,
      paymentMethod: paymentMethod,
      status: 'pending', // Status inicial do pedido
      purchaseDate: new Date(),
    });

    const savedOrder = await newOrder.save();

    // 4. Limpar o carrinho do usuário (opcional: pode depender do seu fluxo)
    await Cart.findByIdAndUpdate(cartId, { products: [] });
    req.session.cartId = null; // Limpar o ID do carrinho da sessão

    // 5. Redirecionar o usuário para uma página de sucesso do pedido
    res.redirect(`/order-success/${savedOrder.orderId}`);
    res.status(200).json({ message: 'Pedido realizado com sucesso!', orderId: savedOrder.orderId });

  } catch (error) {
    console.error('Erro ao processar o checkout:', error);
    res.status(500).send('Erro ao processar o pedido.');
  }
};

module.exports = { 
  createPaymentIntent, 
  paymentSuccess, 
  processCheckout,
 };