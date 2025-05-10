const Product = require('../models/product.model');

class ProductRepository {
    async getAllProducts() {
        try {
            return await Product.find();
        } catch (error) {
            console.error('Erro ao buscar todos os produtos:', error);
            throw error;
        }
    }

    async getProductById(id) {
        try {
            return await Product.findById(id);
        } catch (error) {
            console.error('Erro ao buscar produto por ID:', error);
            throw error;
        }
    }

    async createProduct(productData) {
        try {
            return await Product.create(productData);
        } catch (error) {
            console.error('Erro ao criar produto:', error);
            throw error;
        }
    }

    async updateProduct(id, productData) {
        try {
            return await Product.findByIdAndUpdate(id, productData, { new: true });
        } catch (error) {
            console.error('Erro ao atualizar produto:', error);
            throw error;
        }
    }

    async deleteProduct(id) {
        try {
            return await Product.findByIdAndDelete(id);
        } catch (error) {
            console.error('Erro ao deletar produto:', error);
            throw error;
        }
    }

    async findProducts(filters, sortOption, skip, limit) {
        try {
            return await Product.find(filters)
                .sort(sortOption)
                .skip(skip)
                .limit(Number(limit));
        } catch (error) {
            console.error('Erro ao buscar produtos com filtros:', error);
            throw error;
        }
    }

    async countProducts(filters) {
        try {
            return await Product.countDocuments(filters);
        } catch (error) {
            console.error('Erro ao contar produtos:', error);
            throw error;
        }
    }

}

module.exports = new ProductRepository();