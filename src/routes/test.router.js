const express = require('express');
const router = express.Router();

router.get('/test', (req, res) => {
    res.send('Teste de rota funcionando!');
});

module.exports = router;