// entregaParcial3/src/controllers/product.controller.js
const productRepository = require('../repositories/products.repository');
const Product = require("../models/product.model");

// Controlador para listar os produtos
const getProducts = async (req, res) => {
    try {
        const products = await productRepository.getAllProducts();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar produtos', error: error.message });
    }
};

// Controlador para adicionar um produto
const createProduct = async (req, res) => {
    try {
        const newProduct = await productRepository.createProduct(req.body);
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao criar produto', error: error.message });
    }
};

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
        res.status(500).json({ status: "error", message: error.message });
    }
};

const addProduct = async (req, res) => {
    try {
        const { title, description, price, category, stock, image } = req.body;

        const newProduct = await productRepository.createProduct({ // Usando o repository
            title,
            description,
            price,
            category,
            stock,
            image,
        });

        res.status(201).json({ message: "Produto adicionado com sucesso", product: newProduct });
    } catch (error) {
        res.status(400).json({ message: "Erro ao adicionar produto", error: error.message });
    }
};

const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedProduct = await productRepository.updateProduct(id, req.body); // Usando o repository
        if (!updatedProduct) {
            return res.status(404).json({ message: "Produto não encontrado" });
        }
        res.json(updatedProduct);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Controlador para excluir um produto
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        await productRepository.deleteProduct(id); // Usando o repository
        res.status(200).json({ message: "Produto excluído com sucesso" });
    } catch (error) {
        res.status(400).json({ message: "Erro ao excluir produto", error: error.message });
    }
};

module.exports = {
    getProducts,
    createProduct,
    updateProduct,
    getAllProducts,
    addProduct,
    deleteProduct,
};

console.log(createProduct);