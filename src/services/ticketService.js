const CartRepository = require("../repositories/cart.repository");
const ticketRepository = require("../repositories/ticket.repository");

const cartRepository = new CartRepository();

const createTicketFromCart = async (cartId, userId) => {
  try {
    const cart = await cartRepository.getCartById(cartId);
    if (!cart) {
      throw new Error("Carrinho não encontrado");
    }

    const products = cart.products;
    const productsFormatted = products.map((product) => {
      return {
        productId: product._id,
        quantity: product.quantity,
        price: product.productId.price,
      };
    });
    console.log("----cart is:----\n", cart);
    console.log("\n----products are:----\n", productsFormatted);
    const ticket = await ticketRepository.createTicket(userId, products);

    // await CartDAO.clearCart(cartId);

    return ticket;
  } catch (error) {
    throw error;
  }
};

module.exports = { createTicketFromCart };
