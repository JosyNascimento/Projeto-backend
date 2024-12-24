const express = require("express");
const Product = require("../models/Product"); // Substitua pelo caminho correto do seu modelo
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { limit = 10, page = 1, sort, query } = req.query;

    //  Validando e Convertendo parâmetros para os tipos corretos
    const limitNum = parseInt(limit, 10) || 10;
    const pageNum = parseInt(page, 10) || 1;
    const sortOption =
      sort === "asc" ? { price: 1 } : sort === "desc" ? { price: -1 } : {};

    // Criando o filtro com base na consulta
    const filter = query
      ? { $or: [{ category: query }, { available: query === "true" }] }
      : {};

    // Consultando o MongoDB com paginação, filtro e ordenação
    const products = await Product.paginate(filter, {
      limit: limitNum,
      page: pageNum,
      sort: sortOption,
    });

    const {
      docs,
      totalPages,
      prevPage,
      nextPage,
      page: currentPage,
    } = products;

    // Criando links de navegação
    const baseUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}`;
    const prevLink = prevPage
      ? `${baseUrl}/products?limit=${limit}&page=${prevPage}&sort=${sort}&query=${query}`
      : null;
    const nextLink = nextPage
      ? `${baseUrl}/products?limit=${limit}&page=${nextPage}&sort=${sort}&query=${query}`
      : null;

    res.json({
      status: "success",
      payload: docs,
      totalPages,
      prevPage,
      nextPage,
      page: currentPage,
      hasPrevPage: !!prevPage,
      hasNextPage: !!nextPage,
      prevLink,
      nextLink,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
});

module.exports = router;
