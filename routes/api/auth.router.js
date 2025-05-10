// routes/api/auth.router.js
const express = require('express');
const router = express.Router();

router.get('/session', (req, res) => {
  if (req.session && req.session.user) {
    res.json({
      loggedIn: true,
      firstName: req.session.user.first_name,
    });
  } else {
    res.json({ loggedIn: false });
  }
});

router.post('/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: 'Erro ao realizar logout', error: err });
      }
      res.clearCookie('connect.sid'); // Limpa o cookie de sessão
      res.status(200).json({ message: 'Logout realizado com sucesso' });
    });
  });
  

module.exports = router;
