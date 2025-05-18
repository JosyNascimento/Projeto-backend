// chat.js
document.addEventListener("DOMContentLoaded", () => {
  const socket = io();

  // Enviar mensagem
  document.getElementById('chatForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('user').value;
    const message = document.getElementById('message').value;

    if (!user || !message) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    socket.emit('newMessage', { user, message });
    document.getElementById('message').value = ''; // Limpa o campo de mensagem após enviar
  });

  // Receber histórico de mensagens
  socket.on('messageHistory', (messages) => {
    const messagesList = document.getElementById('messages');
    messagesList.innerHTML = messages
      .map((msg) => `<li><strong>${msg.user}:</strong> ${msg.message}</li>`)
      .join('');
  });
});
