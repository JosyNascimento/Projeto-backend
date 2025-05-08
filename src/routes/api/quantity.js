// Importação dos módulos necessários
const express = require('express');
const router = express.Router();

// Rota para retornar a quantidade de itens no carrinho
router.get('/quantity', (req, res) => {
    // Aqui, vamos supor que o carrinho esteja salvo na sessão
    const cart = req.session.cart || {}; // Se não houver carrinho, inicia um objeto vazio
    const quantity = cart.items ? cart.items.length : 0; // Conta o número de itens no carrinho

    // Retorna a quantidade de itens como resposta JSON
    res.json({ quantity });
});

module.exports = router;
