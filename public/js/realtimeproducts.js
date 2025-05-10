const socket = io();
const productList = document.getElementById('product-list');

socket.on('updateProducts', (products) => {
  productList.innerHTML = ''; // Limpa a lista atual
  if (products && products.length > 0) {
    products.forEach(product => {
      const listItem = document.createElement('li');
      listItem.innerHTML = `<strong>${product.title}</strong> - Preço: $${product.price}`;
      if (product.description) {
        listItem.innerHTML += ` - ${product.description}`;
      }
      productList.appendChild(listItem);
    });
  } else {
    const listItem = document.createElement('li');
    listItem.textContent = 'Nenhum produto cadastrado ainda.';
    productList.appendChild(listItem);
  }
});