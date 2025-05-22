// routes/products.router.js
const express = require('express');
const router = express.Router();
const upload = require('../config/multer.config'); // Importando o multer
const productController = require('../controllers/product.controller');

// Importação organizada dos métodos do controller
const {
  getHomePage,
  getAllProducts,
  renderAddProduct,
  renderEditProduct,
  createProduct
} = require('../controllers/product.controller');

/**
 * @swagger
 * tags:
 *   name: Produtos (Views)
 *   description: Páginas renderizadas de produtos
 */

router.get('/', getHomePage); 
router.get('/products', getAllProducts);
router.get('/add', renderAddProduct);// router.get('/products', renderProductsPage); // Vitrine com permissões (comentado)
router.get('/edit/:id', renderEditProduct);

router.post('/product/:id', upload.single('thumbnail'),productController.updateProduct);
router.post('/upload', upload.single('images'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('Nenhum arquivo de imagem foi enviado.');
  }
  console.log('Arquivo recebido:', req.file);
  const imagePath = `/images/${req.file.filename}`; // Caminho para salvar no banco de dados
  res.send('Arquivo de imagem enviado com sucesso. Caminho: ' + imagePath);
});

module.exports = router;
