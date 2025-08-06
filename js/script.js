document.addEventListener('DOMContentLoaded', function() {
    
    // Menú móvil
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const dropdowns = document.querySelectorAll('.dropdown');

hamburger.addEventListener('click', function() {
    this.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Cerrar menú al hacer clic en un enlace
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', function(e) {
        if (window.innerWidth <= 992) {
            // Solo para móviles
            if (this.parentElement.classList.contains('dropdown')) {
                e.preventDefault();
                const dropdownMenu = this.nextElementSibling;
                dropdownMenu.classList.toggle('active');
            } else {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        }
    });
});

// Cerrar menú al hacer clic fuera
document.addEventListener('click', function(e) {
    if (window.innerWidth <= 992 && !e.target.closest('.nav-container')) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            menu.classList.remove('active');
        });
    }
});
    
    
    
    
    
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