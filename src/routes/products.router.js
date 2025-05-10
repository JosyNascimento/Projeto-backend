// routes/products.router.js
const express = require('express');
const router = express.Router();
const upload = require('../config/multer.config'); // Importando o multer

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

router.get('/', getHomePage); // Página home
router.get('/products', getAllProducts);
// router.get('/products', renderProductsPage); // Vitrine com permissões (comentado)
router.get('/add', renderAddProduct);
router.get('/edit/:id', renderEditProduct);

router.post('/products', upload.single('thumbnail'), createProduct);

router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('Nenhum arquivo de imagem foi enviado.');
  }
  console.log('Arquivo recebido:', req.file);
  const imagePath = `/uploads/${req.file.filename}`; // Caminho para salvar no banco de dados
  res.send('Arquivo de imagem enviado com sucesso. Caminho: ' + imagePath);
});

module.exports = router;
