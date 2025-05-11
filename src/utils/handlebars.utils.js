// src/utils/handlebars.utils.js
const moment = require("moment");
const path = require('path')

const multiply = (a, b) => {
  const valA = parseFloat(a);
  const valB = parseFloat(b);

  if (isNaN(valA) || isNaN(valB)) {
    return "0.00";
  }

  return (valA * valB).toFixed(2);
};

const formatDate = (date) => moment(date).format("DD/MM/YYYY HH:mm:ss");
const isValidImagePath = (src) =>
  typeof src === 'string' &&
  src.trim().length > 0 &&
  src.startsWith('/images/') &&
  path.extname(src).match(/\.(jpg|jpeg|png|webp|gif)$/i)

// Retorna o thumbnail principal OU o primeiro válido de thumbnails
const renderProductImage = (product) => {
  if (!product) return null

  // Tenta primeiro o campo 'thumbnail'
  if (isValidImagePath(product.thumbnail)) {
    return product.thumbnail
  }

  // Se não tiver, tenta thumbnails[0]
  if (Array.isArray(product.thumbnails)) {
    const firstValid = product.thumbnails.find(isValidImagePath)
    if (firstValid) return firstValid
  }

  // Se nada for válido, retorna null
  return null
}

// Retorna array de todas imagens válidas (thumbnail + thumbnails[])
const renderProductImages = (product) => {
  if (!product) return []

  const images = []

  if (isValidImagePath(product.thumbnail)) {
    images.push(product.thumbnail)
  }

  if (Array.isArray(product.thumbnails)) {
    const validThumbnails = product.thumbnails.filter(isValidImagePath)
    images.push(...validThumbnails)
  }

  // Remove duplicatas (caso thumbnail esteja também em thumbnails)
  return [...new Set(images)]
}

module.exports = {
  multiply,
  formatDate,
  renderProductImage,
  renderProductImages,
};
