// controllers/realtimeproducts.controller.js
const Product = require('../models/product.model');

// Renderiza a página realtimeproducts
const getRealtimeProductsView = (req, res) => {
    res.render('realtimeproducts', { title: 'Produtos em Tempo Real' });
};

// Busca todos os produtos do banco para a view inicial
const getRealtimeProductsData = async (req, res) => {
    try {
        const products = await Product.find().lean(); // Busca todos os produtos do banco
        res.render('realtimeproducts', { products });
    } catch (error) {
        console.error('Erro ao buscar produtos em tempo real:', error);
        res.status(500).send('Erro ao carregar produtos.');
    }
};

// Adiciona um novo produto
const addProduct = async (req, res) => {
  console.log('INÍCIO da função addProduct');
  console.log('Dados recebidos:', req.body);
  try {
      const newProduct = new Product(req.body);
      console.log('Novo produto criado:', newProduct);
      const savedProduct = await newProduct.save();
      console.log('Produto SALVO no banco:', savedProduct);

      const io = req.app.get('io');
      console.log('Instância do Socket.IO:', io);

      if (io) {
          io.emit('newProduct', savedProduct);
          console.log('Evento "newProduct" EMITIDO:', savedProduct);
      } else {
          console.error('ERRO: Instância do Socket.IO não encontrada!');
      }

      res.status(201).json({ message: 'Produto adicionado com sucesso!', product: savedProduct });
      console.log('RESPOSTA enviada com sucesso:', { message: 'Produto adicionado com sucesso!', product: savedProduct });

  } catch (error) {
      console.error('ERRO no bloco catch:', error);
      res.status(500).json({ message: 'Erro ao adicionar produto.', error: error.message });
      console.log('RESPOSTA de erro enviada:', { message: 'Erro ao adicionar produto.', error: error.message });
  }
  console.log('FIM da função addProduct');
};
// Deleta um produto
const deleteProduct = async (req, res) => {
    try {
        const { pid } = req.params;
        await Product.findByIdAndDelete(pid);
        const io = req.app.get('io');
        io.emit('productDeleted', pid); // Emitir evento para remover do frontend
        res.status(200).json({ message: 'Produto deletado com sucesso!' });
    } catch (error) {
        console.error('Erro ao deletar produto:', error);
        res.status(500).json({ message: 'Erro ao deletar produto.', error: error.message });
    }
};

// Edita um produto
const editProduct = async (req, res) => {
    try {
        const { pid } = req.params;
        const updatedProduct = await Product.findByIdAndUpdate(pid, req.body, { new: true });
        const io = req.app.get('io');
        io.emit('productUpdated', updatedProduct); // Emitir evento com o produto atualizado
        res.status(200).json({ message: 'Produto editado com sucesso!', product: updatedProduct });
    } catch (error) {
        console.error('Erro ao editar produto:', error);
        res.status(500).json({ message: 'Erro ao editar produto.', error: error.message });
    }
};

// Busca todos os produtos (geralmente para uma API, não para renderizar a view realtime)
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().lean();
    res.json({ status: 'success', payload: products });
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).json({ status: 'error', message: 'Erro ao buscar produtos' });
  }
};


module.exports = {
    getRealtimeProducts: getRealtimeProductsData, // Usando a função que busca os dados para renderizar
    addProduct,
    deleteProduct,
    editProduct,
    getAllProducts, // Mantendo para outras funcionalidades da API, se necessário
    getRealtimeProductsView // Mantendo a função que apenas renderiza a view, se necessário em algum ponto
};