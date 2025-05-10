// entregaParcial3/src/dao/product.dao.js
const Product = require('../dao/models/product.model');



const renderHome = async (req, res) => {
  const products = await Product.find();
  const cartId = req.session.user.cart; 
  res.render('home', { products, cartId });
};

const getAllProducts = async (req, res) => {
    try {
        const products = await productDAO.findAll();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar produtos', error: error.message });
    }
};
class ProductDAO {
    async create(productData) {
        return await Product.create(productData);
    }

    async update(id, productData) {
        try {
            const updatedProduct = await Product.findByIdAndUpdate(id, productData, { new: true });
            if (!updatedProduct) {
                throw new Error("Produto não encontrado");
            }
            return updatedProduct;
        } catch (error) {
            console.error("Erro ao atualizar produto:", error);
            throw error; // Relança o erro para o controlador
        }
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
