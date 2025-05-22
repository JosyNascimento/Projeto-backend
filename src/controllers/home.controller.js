// EntregaFinal/src/controllers/home.controller.js
const ProductService = require('../services/product.service'); 

const getHome = async (req, res) => {
  try {
    const products = await ProductService.getAll(); // ou com paginação, como preferir
    const featuredProducts = products.slice(0, 3); // só exemplo para o carrossel

    const cartId = req.user?.cart || req.session.cartId || null;

    
    res.render('home', {
      products,
      featuredProducts,
      cartId: cartId 
    });    

  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).send('Erro ao carregar a página inicial');
  }
};
module.exports = { getHome };
