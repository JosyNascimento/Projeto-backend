// public/js/chat.js
const socket = io();

document.getElementById('chatForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('user').value;
    const message = document.getElementById('message').value;

    fetch('/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token') // Obtém o token do localStorage
        },
        body: JSON.stringify({ user, message })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => {throw err});
        }
        document.getElementById('message').value = '';
    })
    .catch(error => {
        console.error('Erro ao enviar mensagem:', error);
        alert(error.error)
    });

});

socket.on('messageHistory', (messages) => {
    const messagesList = document.getElementById('messages');
    messagesList.innerHTML = messages
        .map((msg) => `<li class="message-item"><strong>${msg.user}:</strong> ${msg.message}</li>`)
        .join('');
    messagesList.scrollTop = messagesList.scrollHeight;
});

socket.on('newMessage', (msg) => {
    const messagesList = document.getElementById('messages');
    messagesList.innerHTML += `<li class="message-item"><strong>${msg.user}:</strong> ${msg.message}</li>`;
    messagesList.scrollTop = messagesList.scrollHeight;
});