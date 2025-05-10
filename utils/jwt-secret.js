// entregaParcial3/src/utils/jwt-secret.js
const crypto = require('crypto');

function generateSecret(length = 64) {
    return crypto.randomBytes(length).toString('base64');
}

const secret = generateSecret();
console.log('Novo JWT_SECRET:', secret);