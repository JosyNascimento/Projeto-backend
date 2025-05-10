const mongoose = require('mongoose');
const Product = require('./dao/models/product.model');

const products = [
  {
    title: 'Camisa Estilosa',
    description: 'Camisa 100% algodão, confortável e elegante.',
    price: 79.90,
    code: 'PROD001',
    stock: 50,
    category: 'Roupas',
    thumbnail: 'https://via.placeholder.com/150?text=Camisa'
  },
  {
    title: 'Tênis Moderno',
    description: 'Tênis esportivo leve, ideal para corridas.',
    price: 199.99,
    code: 'PROD002',
    stock: 30,
    category: 'Calçados',
    thumbnail: 'https://via.placeholder.com/150?text=T%C3%AAnis'
  },
  {
    title: 'Mochila Casual',
    description: 'Mochila resistente para o dia a dia.',
    price: 149.00,
    code: 'PROD003',
    stock: 20,
    category: 'Acessórios',
    thumbnail: 'https://via.placeholder.com/150?text=Mochila'
  },
  {
    title: 'Relógio Clássico',
    description: 'Relógio com pulseira de couro e design elegante.',
    price: 299.90,
    code: 'PROD004',
    stock: 15,
    category: 'Acessórios',
    thumbnail: 'https://via.placeholder.com/150?text=Rel%C3%B3gio'
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/ecommerce', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    await Product.deleteMany(); // limpa os produtos anteriores
    await Product.insertMany(products); // insere novos produtos

    console.log('🌱 Banco populado com sucesso!');
    mongoose.disconnect();
  } catch (error) {
    console.error('Erro ao popular banco:', error);
  }
};

seedDatabase();
