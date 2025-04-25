// EntregaParcial3/src/controllers/home.controller.js
const ProductService = require('../services/product.service'); // ajuste o caminho se necessário

const getHome = async (req, res) => {
  try {
    const products = await ProductService.getAll(); // ou com paginação, como preferir
    const featuredProducts = products.slice(0, 3); // só exemplo para o carrossel

    const cartId = req.user?.cart || req.session.cartId || null;

    
    res.render('home', {
      products,
      featuredProducts,
      cartId: req.session.cartId // ou de onde estiver pegando
    })    

  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).send('Erro ao carregar a página inicial');
  }
};
module.exports = { getHome };
