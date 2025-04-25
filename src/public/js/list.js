// public/js/list.js
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('jwtToken');

    if (!token) {
        console.error('Token JWT não encontrado.');
        return;
    }

    fetch('/list', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Resposta JSON:', data);
        // Aqui você pode manipular os dados recebidos (data)
        // e atualizar a interface da sua página.
    })
    .catch(error => {
        console.error('Erro na requisição:', error);
    });
});