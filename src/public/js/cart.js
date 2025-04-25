//src/public/js/cart.js
window.addToCart = async function(productId, cartId) {
  console.log("Função ativada com", productId, cartId);

  if (!cartId) {
    alert('Carrinho não encontrado. Faça login novamente.');
    return;
  }

  try {
    const response = await fetch(`/api/carts/${cartId}/product/${productId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: 1 })
    });

    if (response.ok) {
      alert("Produto adicionado ao carrinho!");
      window.location.href = `/carts/${cartId}`;
    } else {
      const error = await response.json();
      alert("Erro ao adicionar ao carrinho: " + error.message);
    }
  } catch (err) {
    console.error("Erro inesperado:", err);
    alert("Erro inesperado ao adicionar ao carrinho.");
  }
};
