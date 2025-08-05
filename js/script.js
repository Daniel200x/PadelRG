document.addEventListener('DOMContentLoaded', function() {
    // Slider principal
    const slider = document.querySelector('.slider');
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.querySelector('.prev-arrow');
    const nextBtn = document.querySelector('.next-arrow');
    const dotsContainer = document.querySelector('.slider-dots');
    let currentIndex = 0;
    let autoSlideInterval;
    const slideIntervalTime = 5000; // 5 segundos

    // Crear puntos de navegación
    function createDots() {
        slides.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            if (index === 0) dot.classList.add('active');
            dot.addEventListener('click', () => {
                goToSlide(index);
            });
            dotsContainer.appendChild(dot);
        });
    }

    // Actualizar slider
    function updateSlider() {
        slider.style.transform = `translateX(-${currentIndex * 100}%)`;
        
        // Actualizar puntos
        const dots = document.querySelectorAll('.slider-dots .dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }

    // Ir a slide específico
    function goToSlide(index) {
        currentIndex = index;
        updateSlider();
        resetAutoSlide();
    }

    // Slide siguiente
    function nextSlide() {
        currentIndex = (currentIndex + 1) % slides.length;
        updateSlider();
        resetAutoSlide();
    }

    // Slide anterior
    function prevSlide() {
        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
        updateSlider();
        resetAutoSlide();
    }

    // Iniciar auto-desplazamiento
    function startAutoSlide() {
        autoSlideInterval = setInterval(nextSlide, slideIntervalTime);
    }

    // Reiniciar auto-desplazamiento
    function resetAutoSlide() {
        clearInterval(autoSlideInterval);
        startAutoSlide();
    }

    // Inicializar
    createDots();
    startAutoSlide();

    // Event listeners mejorados
    nextBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        nextSlide();
    });

    prevBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        prevSlide();
    });

    // Pausar al interactuar
    [nextBtn, prevBtn, dotsContainer].forEach(element => {
        element.addEventListener('mouseenter', () => {
            clearInterval(autoSlideInterval);
        });
        element.addEventListener('mouseleave', startAutoSlide);
    });

    // Actualizar año del footer
    document.getElementById('current-year').textContent = new Date().getFullYear();
});