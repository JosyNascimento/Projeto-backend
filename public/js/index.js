const socket = io();
const productForm = document.getElementById('productForm');
const productList = document.getElementById('productList');

// Ouve as atualizações de produtos
socket.on('updateProducts', (products) => {
    productList.innerHTML = '';
    products.forEach(product => {
        const productElement = document.createElement('li');
        productElement.setAttribute('data-id', product.id);
        productElement.innerHTML = `
            <h2>${product.title}</h2>
            <p>${product.description}</p>
            <p><strong>Preço:</strong> R$ ${product.price}</p>
            <button class="deleteButton">Excluir</button>
        `;
        productList.appendChild(productElement);
    });

    // Adiciona evento de exclusão para cada botão
    const deleteButtons = document.querySelectorAll('.deleteButton');
    deleteButtons.forEach(button => {
        button.addEventListener('click', () => {
            const productId = button.parentElement.getAttribute('data-id');
            socket.emit('deleteProduct', parseInt(productId));
        });
    });
});

const bcrypt = require('bcrypt');

// Teste do hash e comparação
const testHash = async () => {
  const password = 'minhasenha';
  const hashedPassword = await bcrypt.hash(password, 10);

  console.log('Senha Original:', password);
  console.log('Senha Hash:', hashedPassword);

  const isMatch = await bcrypt.compare(password, hashedPassword);
  console.log('A senha corresponde ao hash?', isMatch);  // Isso deve retornar true
};

testHash();


// Envia novo produto ao servidor
productForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const newProduct = {
        title: document.getElementById('productName').value,
        description: document.getElementById('productDescription').value,
        price: parseFloat(document.getElementById('productPrice').value),
    };
    socket.emit('addProduct', newProduct);
});