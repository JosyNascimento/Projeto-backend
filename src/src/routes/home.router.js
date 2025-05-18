// src/routes/home.router.js
const express = require("express");
const router = express.Router();
const { renderHome } = require("../controllers/home.controller");
const Product = require('../models/product.model');

router.get('/', async (req, res) => {
    try {
      const { page = 1, limit = 9, search = '' } = req.query;
  
      // Filtro de busca
      const query = search
        ? { title: { $regex: search, $options: 'i' } }
        : {};
  
      // Paginação com mongoose-paginate ou manual
      const totalProducts = await Product.countDocuments(query);
      const totalPages = Math.ceil(totalProducts / limit);
      const products = await Product.find(query)
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .lean();
  
      // Produtos em destaque (pode ser aleatório ou os mais recentes)
      const featuredProducts = await Product.find().limit(3).lean();
  
      res.render('home', {
        products,
        featuredProducts,
        page: Number(page),
        totalPages,
        hasNextPage: Number(page) < totalPages,
        hasPrevPage: Number(page) > 1,
        nextPage: Number(page) + 1,
        prevPage: Number(page) - 1,
        search
      });
    } catch (error) {
      console.error('Erro ao renderizar a home:', error);
      res.status(500).send('Erro interno ao carregar a página inicial.');
    }
  });
  
  module.exports = router;