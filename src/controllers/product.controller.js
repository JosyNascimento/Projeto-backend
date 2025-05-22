// src/controllers/product.controller.js
const productRepository = require('../repositories/products.repository');
const Cart = require("../models/cart.model"); // Importando o modelo de Cart
const Product = require("../models/product.model");
const productService = require('../services/productService'); 


// Função para listar produtos com filtros, ordenação e paginação
const getAllProducts = async (req, res) => {
    try {
      let products;
      const { all } = req.query; // Verifica o parâmetro 'all'
  
      if (all === 'true') {
        // Se 'all=true', retorna todos os produtos
        products = await Product.find();
      } else {
        // Caso contrário, pode usar paginação (ou lógica padrão)
        products = await Product.find().limit(10); // Exemplo de limitação de 10 produtos
      }
  
      res.json(products);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      res.status(500).json({ message: 'Erro ao buscar produtos' });
    }
  };
  
// Criar produto (com imagem se enviada)
const createProduct = async (req, res) => {
    try {
      const { title, description, price, code, stock, category } = req.body;
  
      let thumbnails = [];
      if (req.file) {
        thumbnails.push(`/images/${req.file.filename}`);
      }
  
      const newProduct = {
        title,
        description,
        price,
        code,
        stock,
        category,
        thumbnails,
      };
  
      await productService.createProduct(newProduct);
      res.redirect('/add');
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      res.status(500).send('Erro ao criar produto');
    }
  };
// Controlador para excluir um produto
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        await productRepository.deleteProduct(id);
        res.status(200).json({ message: "Produto excluído com sucesso" });
    } catch (error) {
        res.status(400).json({ message: "Erro ao excluir produto", error: error.message });
    }
};

// Controlador para renderizar a página de adicionar produto (formulário)
const renderAddProduct = (req, res) => {
    res.render("addProduct"); 
};

// Controlador para renderizar a página de edição de produto
const renderEditProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const product = await productRepository.getProductById(id);
        if (!product) {
            return res.status(404).json({ message: "Produto não encontrado" });
        }
        res.render("editProduct", { product });
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar produto", error: error.message });
    }
};


// Atualizar produto (opcionalmente com nova imagem)
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;

        // Se o produto tiver uma nova imagem, atualize o campo thumbnails
        if (req.file) {
            updatedData.thumbnails = [`/images/${req.file.filename}`];
        } else {
            // Se não há nova imagem, mantenha o valor anterior ou defina como um array vazio
            updatedData.thumbnails = updatedData.thumbnails || [];
        }

        const updatedProduct = await productRepository.updateProduct(id, updatedData);

        if (!updatedProduct) {
            return res.status(404).json({ message: "Produto não encontrado" });
        }

        res.json(updatedProduct);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
const renderProductsPage = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect("/login");
        }
  
        const role = req.session.user.role;
        const username = req.session.user.email;
        const userId = req.session.user.id; // Obtenha o ID do usuário da sessão
  
        // Busque os produtos do banco de dados
        const products = await Product.find().lean();
  
        // Passa o role do usuario para a view
        const isAdminOrPremium = role === "admin" || role === "premium";
  
        res.render("products", {
            username,
            role,
            user: req.session.user, // Passa o objeto do usuário para a view
            products: products, // Passa os produtos para a view
            isAdminOrPremium: isAdminOrPremium, // Passa a flag para a view
            userId: userId // Passa o ID do usuário para a view
        });
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        res.status(500).send('Erro ao carregar produtos');
    }
  };

  // Função para renderizar a página inicial (home.handlebars)
  const getHomePage = async (req, res) => {
    try {
        // Verifica se o carrinho existe na sessão
        if (!req.session.cartId) {
            // Se não existir, criar um novo carrinho
            const newCart = await Cart.create({ products: [] });
            req.session.cartId = newCart._id;
            console.log(`Carrinho criado para usuário não logado: ${newCart._id}`);
        }

        const featuredProducts = await Product.find({ isFeatured: true }).lean();
        const products = await Product.find().lean();
        console.log('---PRODUTOS AQUI---\n', products)
        const cartId = req.session.cartId; // Agora o cartId deve estar na sessão
        res.render('home', { featuredProducts, products, cartId });
        
    } catch (error) {
        console.error('Erro ao carregar a página inicial:', error);
        res.status(500).send('Erro ao carregar a página inicial.');
    }
};
  

module.exports = {
    getAllProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    renderAddProduct,
    renderEditProduct,
    renderProductsPage,
    getHomePage,
};