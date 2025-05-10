// routes/api/Product.router.js
const express = require('express');
const productController = require('../../controllers/product.controller');
const router = express.Router();
const upload = require('../../config/multer.config'); 
/**
 * @swagger
 * tags:
 *   name: Produtos (API)
 *   description: Endpoints JSON para produtos
 */

// Rota para exibir o formulário de adicionar produto (onde você adicionará o campo de imagem)
router.get('/add', (req, res) => {
  res.render('addProduct'); // Supondo que você tenha uma view 'addProduct.handlebars'
});

// Rota POST para lidar com a adição de um novo produto (incluindo o upload da imagem)
router.post('/add', upload.single('productImage'), async (req, res) => {
  try {
      if (!req.file) {
          return res.status(400).send('Por favor, selecione uma imagem para o produto.');
      }

      const { name, description, price, stock } = req.body; // Adicione 'stock' aqui se você o tem no formulário
      const imagePath = `/uploads/${req.file.filename}`;

      const newProduct = {
          title: name, // Use 'name' do req.body que corresponde ao 'title' no seu modelo
          description: description,
          price: parseFloat(price),
          stock: parseInt(stock) || 0, // Garante que 'stock' seja um número, padrão para 0 se não fornecido
          thumbnail: imagePath // Salva o caminho da imagem no campo 'thumbnail' (assumindo que você quer usar este campo)
          // Se você quiser usar 'thumbnails':
          // thumbnails: [imagePath]
      };

      const savedProduct = await Product.create(newProduct);
      console.log('Produto adicionado com sucesso:', savedProduct);
      res.redirect('/products'); // Redirecione para a página de produtos após a criação
  } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      res.status(500).send('Erro ao adicionar produto.');
  }
});


router.get('/', productController.getAllProducts); // /api/products

router.post('/', productController.createProduct);
router.put('/:id', productController.updateProduct);

router.delete('/admin/product/:pid', async (req, res) => {
    const { pid } = req.params;
    try {
      await Product.deleteOne({ _id: pid });
      res.sendStatus(204); // ou res.status(200).send('Produto deletado')
    } catch (error) {
      res.status(500).json({ error: 'Erro ao deletar produto' });
    }
  });
  

module.exports = router;
