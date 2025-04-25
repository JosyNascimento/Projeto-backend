// src/utils/generateMockProduct.js
const { faker } = require('@faker-js/faker');

function generateMockProduct() {
  return {
    title: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    price: parseFloat(faker.commerce.price()),
    stock: faker.number.int({ min: 1, max: 100 }),
    category: faker.commerce.department(),
    thumbnails: [faker.image.url()],
    code: faker.string.alphanumeric(8),
    status: true
  };
}

module.exports = generateMockProduct;
