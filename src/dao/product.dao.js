// entregaParcial3/src/dao/product.dao.js
const Product = require('../models/product.model');

class ProductDAO {
    async create(productData) {
        return await Product.create(productData);
    }

    async update(id, productData) {
        return await Product.findByIdAndUpdate(id, productData, { new: true });
    }

    async delete(id) {
        return await Product.findByIdAndDelete(id);
    }

    async findById(id) {
        return await Product.findById(id);
    }

    async findAll() {
        return await Product.find();
    }
}

module.exports = ProductDAO;
