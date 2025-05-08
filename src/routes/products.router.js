// routes/products.router.js
const express = require('express');
const productController = require('../controllers/product.controller');
const router = express.Router();
const upload = require('../middlewares/multer.diskStorage');
/**
 * @swagger
 * tags:
 *   name: Produtos (Views)
 *   description: Páginas renderizadas de produtos
 */

router.get('/', productController.getHomePage); // Página home
router.get('/products', productController.getAllProducts);
//router.get('/products', productController.renderProductsPage); // Vitrine com permissões
router.get('/add', productController.renderAddProduct);
router.get('/edit/:id', productController.renderEditProduct);

router.post('/add', upload.single('image'), productController.createProduct);

router.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('Nenhum arquivo de imagem foi enviado.');
    }
    console.log('Arquivo recebido:', req.file);
    const imagePath = `/uploads/${req.file.filename}`; // Caminho para salvar no banco de dados
    res.send('Arquivo de imagem enviado com sucesso. Caminho: ' + imagePath);
});

module.exports = router;
