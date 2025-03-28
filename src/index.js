// index.js (projeto mínimo)
const express = require('express');
const app = express();

const renderUserList = async (req, res) => {
  console.log('renderUserList chamado!');
  res.send('Lista de usuários simples');
};

app.get('/users', renderUserList);

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});