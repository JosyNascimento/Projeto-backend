document.addEventListener('DOMContentLoaded', () => {
  const prevButton = document.querySelector('.carousel-button.prev');
  const nextButton = document.querySelector('.carousel-button.next');
  const slide = document.querySelector('.carousel-slide');
  const items = document.querySelectorAll('.carousel-item');

  let currentIndex = 0;
  const itemWidth = items[0]?.offsetWidth + 20 || 320; // 20 é o margin/padding

  function updateCarousel() {
    slide.style.transform = `translateX(-${currentIndex * itemWidth}px)`;
  }

  nextButton?.addEventListener('click', () => {
    if (currentIndex < items.length - 1) {
      currentIndex++;
      updateCarousel();
    }
  });

  prevButton?.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex--;
      updateCarousel();
    }
  });

  updateCarousel(); // inicia corretamente
});
