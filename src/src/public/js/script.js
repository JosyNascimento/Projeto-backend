const socket = io();

document.getElementById("addProductForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const title = document.getElementById("productTitle").value;
  const description = document.getElementById("productDescription").value;
  const price = document.getElementById("productPrice").value;
  socket.emit("addProduct", { title, description, price });
});
