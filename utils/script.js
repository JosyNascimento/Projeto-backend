// enteregaParcial3/src/utils/script.js
const navbar = document.querySelector('.navbar');
const toggleButton = document.getElementById('Keraprof');

toggleButton.addEventListener('click', () => {
  navbar.classList.toggle('bg-light');
  navbar.classList.toggle('bg-dark');
  navbar.classList.toggle('navbar-light');
  navbar.classList.toggle('navbar-dark');
});

