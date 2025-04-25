const express = require('express');
const productController = require('../../controllers/product.controller');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Produtos (API)
 *   description: Endpoints JSON para produtos
 */

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
