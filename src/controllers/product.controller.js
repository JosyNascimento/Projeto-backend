// src/controllers/product.controller.js
const productRepository = require('../repositories/products.repository');

const Product = require("../models/product.model");


// Função para listar produtos com filtros, ordenação e paginação
const getAllProducts = async (req, res) => {
    try {
        const { query, sort, page = 1, limit = 10 } = req.query;

        // Filtros e busca
        const filters = query === "inStock" ? { stock: { $gt: 0 } } : query ? { category: query } : {};

        // Ordenação
        const sortOption = sort === "asc" ? { price: 1 } : sort === "desc" ? { price: -1 } : {};

        // Paginação
        const skip = (page - 1) * limit;
        const products = await Product.find(filters)
            .sort(sortOption)
            .skip(skip)
            .limit(Number(limit));

        const totalProducts = await Product.countDocuments(filters);
        const totalPages = Math.ceil(totalProducts / limit);

        res.status(200).json({
            status: "success",
            payload: products,
            totalPages,
            page: Number(page),
        });
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        res.status(500).send('Erro ao buscar produtos.');
    }
};

const createProduct = async (req, res) => {
    try {
        const newProduct = await productRepository.createProduct(req.body);
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao criar produto', error: error.message });
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
    res.render("addProduct"); // Certifique-se de que o arquivo `views/addProduct.handlebars` existe
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

// Controlador para atualizar um produto existente
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedProduct = await productRepository.updateProduct(id, req.body);

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

module.exports = {
    getAllProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    renderAddProduct,
    renderEditProduct,
    renderProductsPage,
};
