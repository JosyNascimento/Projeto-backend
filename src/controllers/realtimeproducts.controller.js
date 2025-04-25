const Product = require('../dao/models/Product.model');

// Renderiza a página realtimeproducts
exports.getRealtimeProducts = async (req, res) => {
  res.render('realtimeproducts', { title: 'Produtos em Tempo Real' });
};

// Adiciona um novo produto
exports.addProduct = async (req, res) => {
  try {
    const { title, description, price } = req.body;
    await Product.create({ title, description, price });
    
    // Notifica clientes conectados via socket (se aplicável)
    req.app.get('io').emit('updateProducts', await Product.find());

    res.json({ message: 'Produto adicionado com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao adicionar produto' });
  }
};

exports.deleteProduct = async (req, res) => {
    try {
      const { pid } = req.params;
      await Product.findByIdAndDelete(pid);
  
      req.app.get('io').emit('updateProducts', await Product.find());
      res.json({ message: 'Produto deletado com sucesso' });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao deletar produto' });
    }
  };
  
  exports.editProduct = async (req, res) => {
    try {
      const { pid } = req.params;
      const updatedData = req.body;
  
      const updatedProduct = await Product.findByIdAndUpdate(pid, updatedData, { new: true });
  
      req.app.get('io').emit('updateProducts', await Product.find());
      res.json({ message: 'Produto atualizado com sucesso', product: updatedProduct });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao editar produto' });
    }
  };
  
  exports.getAllProducts = async (req, res) => {
    try {
      const products = await Product.find();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: 'Erro ao buscar produtos' });
    }   
  }  