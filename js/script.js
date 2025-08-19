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

      // Sistema de noticias dinámicas
    const newsContainer = document.getElementById('news-container');
    const pagination = document.getElementById('pagination');
    const prevBtnNews = document.getElementById('prev-btn');
    const nextBtnNews = document.getElementById('next-btn');
    const pageNumbers = document.getElementById('page-numbers');
    
    let currentPage = 1;
    const newsPerPage = 3;
    let allNews = [];
    
  // Función para convertir fecha en formato "15 Agosto 2023" a Date object
function parseCustomDate(dateStr) {
    const months = {
        'Enero': 0, 'Febrero': 1, 'Marzo': 2, 'Abril': 3, 'Mayo': 4, 'Junio': 5,
        'Julio': 6, 'Agosto': 7, 'Septiembre': 8, 'Octubre': 9, 'Noviembre': 10, 'Diciembre': 11
    };
    
    const parts = dateStr.split(' ');
    const day = parseInt(parts[0]);
    const month = months[parts[1]];
    const year = parseInt(parts[2]);
    
    return new Date(year, month, day);
}

// Modificar la función loadNews
async function loadNews() {
    try {
        const response = await fetch('data/news.json');
        if (!response.ok) {
            throw new Error('Error al cargar las noticias');
        }
        const data = await response.json();
        
        // Ordenar noticias por fecha (más recientes primero)
        allNews = data.news.sort((a, b) => {
            return parseCustomDate(b.date) - parseCustomDate(a.date);
        });
        
        displayNews();
        setupPagination();
    } catch (error) {
        console.error('Error cargando noticias:', error);
        showNewsError('No se pudieron cargar las noticias. Por favor intenta más tarde.');
    }
}
    function showNewsError(message) {
        newsContainer.innerHTML = `
            <div class="news-error">
                <i class="fas fa-exclamation-circle"></i>
                <p>${message}</p>
                <button id="retry-btn" class="btn">Reintentar</button>
            </div>
        `;
        
        document.getElementById('retry-btn').addEventListener('click', loadNews);
    }
    
    // Mostrar noticias según página actual
    function displayNews() {
        const startIndex = (currentPage - 1) * newsPerPage;
        const endIndex = startIndex + newsPerPage;
        const newsToShow = allNews.slice(startIndex, endIndex);
        
        newsContainer.innerHTML = '';
        
        if (newsToShow.length === 0) {
            newsContainer.innerHTML = '<p class="news-error">No hay noticias disponibles.</p>';
            return;
        }
        
        newsToShow.forEach(news => {
            const newsCard = document.createElement('article');
            newsCard.className = 'news-card';
            newsCard.innerHTML = `
                <div class="news-image">
                    <img src="${news.image}" alt="${news.alt}" loading="lazy">
                </div>
                <div class="news-content">
                    <span class="news-date">${news.date}</span>
                    <h3>${news.title}</h3>
                    <p>${news.summary}</p>
                    <a href="#" class="news-link" data-id="${news.id}">Leer más <i class="fas fa-arrow-right"></i></a>
                </div>
            `;
            newsContainer.appendChild(newsCard);
        });
        
        // Agregar event listeners a los botones "Leer más"
        document.querySelectorAll('.news-link').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const newsId = parseInt(this.getAttribute('data-id'));
                showFullNews(newsId);
            });
        });
    }
    
    // Configurar paginación
    function setupPagination() {
    const pageCount = Math.ceil(allNews.length / newsPerPage);
    pageNumbers.innerHTML = '';
        
        // Mostrar máximo 5 números de página a la vez
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(pageCount, startPage + maxVisiblePages - 1);
        
        // Ajustar si estamos cerca del final
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        // Botón para primera página si no está visible
        if (startPage > 1) {
            const firstPage = document.createElement('div');
            firstPage.className = 'page-number';
            firstPage.textContent = '1';
            firstPage.addEventListener('click', () => {
                currentPage = 1;
                displayNews();
                updatePaginationButtons();
            });
            pageNumbers.appendChild(firstPage);
            
            if (startPage > 2) {
                const ellipsis = document.createElement('div');
                ellipsis.className = 'page-ellipsis';
                ellipsis.textContent = '...';
                pageNumbers.appendChild(ellipsis);
            }
        }
        
        // Páginas visibles
        for (let i = startPage; i <= endPage; i++) {
            const pageNumber = document.createElement('div');
            pageNumber.className = 'page-number';
            if (i === currentPage) pageNumber.classList.add('active');
            pageNumber.textContent = i;
            pageNumber.addEventListener('click', () => {
                currentPage = i;
                displayNews();
                updatePaginationButtons();
            });
            pageNumbers.appendChild(pageNumber);
        }
        
        // Botón para última página si no está visible
        if (endPage < pageCount) {
            if (endPage < pageCount - 1) {
                const ellipsis = document.createElement('div');
                ellipsis.className = 'page-ellipsis';
                ellipsis.textContent = '...';
                pageNumbers.appendChild(ellipsis);
            }
            
            const lastPage = document.createElement('div');
            lastPage.className = 'page-number';
            lastPage.textContent = pageCount;
            lastPage.addEventListener('click', () => {
                currentPage = pageCount;
                displayNews();
                updatePaginationButtons();
            });
            pageNumbers.appendChild(lastPage);
        }
        
        updatePaginationButtons();
    }
    
    // Actualizar botones de paginación
    function updatePaginationButtons() {
        const pageCount = Math.ceil(allNews.length / newsPerPage);
        
        prevBtnNews.disabled = currentPage === 1;
        nextBtnNews.disabled = currentPage === pageCount;
        
        // Actualizar clases activas de números de página
        document.querySelectorAll('.page-number').forEach(number => {
            number.classList.toggle('active', parseInt(number.textContent) === currentPage);
        });
    }
    
  function maintainScrollPosition() {
    const newsSection = document.querySelector('.news-section');
    const scrollPosition = window.scrollY;
    const newsSectionTop = newsSection.offsetTop;
    
    if (scrollPosition >= newsSectionTop) {
        requestAnimationFrame(() => {
            window.scrollTo({
                top: newsSectionTop,
                behavior: 'auto'
            });
        });
    }
}

// Reemplaza los event listeners de paginación con este código
prevBtnNews.addEventListener('click', async (e) => {
    e.preventDefault();
    if (currentPage > 1) {
        // Mostrar loader
        newsContainer.innerHTML = '<div class="news-loader">Cargando noticias...</div>';
        
        currentPage--;
        
        // Pequeña pausa para permitir el renderizado
        await new Promise(resolve => setTimeout(resolve, 50));
        
        displayNews();
        updatePaginationButtons();
        
        // Scroll a la primera noticia en móviles
        if (window.innerWidth <= 768) {
            const firstNewsCard = document.querySelector('.news-card');
            if (firstNewsCard) {
                firstNewsCard.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    }
});

nextBtnNews.addEventListener('click', async (e) => {
    e.preventDefault();
    const pageCount = Math.ceil(allNews.length / newsPerPage);
    if (currentPage < pageCount) {
        // Mostrar loader
        newsContainer.innerHTML = '<div class="news-loader">Cargando noticias...</div>';
        
        currentPage++;
        
        // Pequeña pausa para permitir el renderizado
        await new Promise(resolve => setTimeout(resolve, 50));
        
        displayNews();
        updatePaginationButtons();
        
        // Scroll a la primera noticia en móviles
        if (window.innerWidth <= 768) {
            const firstNewsCard = document.querySelector('.news-card');
            if (firstNewsCard) {
                firstNewsCard.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    }
});



    // Modal para noticia completa
   // Modal para noticia completa
function showFullNews(newsId) {
    const news = allNews.find(item => item.id === newsId);
    if (!news) return;
    
    const modal = document.createElement('div');
    modal.className = 'news-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <button class="modal-close">&times;</button>
                <h3 class="modal-title">${news.title}</h3>
                <span class="modal-date">${news.date}</span>
            </div>
            <div class="modal-body">
                <img src="${news.image}" alt="${news.alt}" class="modal-image" loading="eager">
                <p>${news.fullContent}</p>
                <div class="modal-footer">
                    <button class="btn modal-btn">Cerrar</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    modal.style.display = 'block';
    
    // Cerrar modal
    const closeBtn = modal.querySelector('.modal-close');
    const closeBtnFooter = modal.querySelector('.modal-btn');
    
    const closeModal = () => {
        document.body.removeChild(modal);
        document.body.style.overflow = '';
    };
    
    closeBtn.addEventListener('click', closeModal);
    closeBtnFooter.addEventListener('click', closeModal);
    
    // Cerrar al hacer clic fuera o presionar ESC
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    document.addEventListener('keydown', function handleEscape(e) {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', handleEscape);
        }
    });
    
    // Opcional: Hacer la imagen clickeable para ver en tamaño completo
    const modalImage = modal.querySelector('.modal-image');
    modalImage.addEventListener('click', function() {
        this.classList.toggle('expanded');
    });
}
    
    // Cargar noticias al iniciar
    loadNews();



   // Sistema de publicidad personalizada - VERSIÓN CORREGIDA
    class AdManager {
        constructor() {
            this.ads = [
            {
                image: 'img/publi/publi.jpg',
                link: '',
                title: 'Tu publicidad acá',
                description: 'Publicita tu producto con nosotros.'
            },
                {
                image: 'img/publi/muebles.jpeg',
                link: 'https://www.instagram.com/rpamoblamientos.tdf?igsh=dTNrcHEwNndmeGF4',
                title: 'RPA Moblamientos',
                description: 'Los mejores muebles para tu hogar en Tierra del Fuego. Calidad y diseño en cada pieza.'
            },
            {
                image: 'img/publi/tienda.jpg',
                link: '',
                title: 'Tienda de Pádel',
                description: 'Encuentra las mejores palas, pelotas y accesorios para tu juego. ¡Ofertas especiales!'
            },
            {
                image: 'img/publi/publi.jpg',
                link: '',
                title: 'Tu publicidad acá',
                description: 'Publicita tu producto con nosotros.'
            },
            {
                image: 'img/publi/clases.jpg',
                link: '',
                title: 'Clases de Pádel',
                description: 'Mejora tu técnica con profesores certificados. Todos los niveles.'
            }
        ];
            
           this.previousAdIndex = -1; // Para evitar repetir el mismo anuncio consecutivamente
            this.adShown = false;
            this.adTimer = null;
            this.scrollThreshold = 70;
            
            this.init();
        }
        
        init() {
            // Crear elementos del modal si no existen
            if (!document.getElementById('ad-modal')) {
                this.createAdModal();
            }
            
            // Configurar event listeners
            this.setupEventListeners();
            
            // Programar la primera publicidad
            this.scheduleAd();
        }
        
        createAdModal() {
            const modalHTML = `
                <div id="ad-modal" class="ad-modal">
                    <div class="ad-modal-content">
                        <span class="ad-close">&times;</span>
                        <div class="ad-header">
                            <h3>Publicidad</h3>
                        </div>
                        <div class="ad-body">
                            <a href="#" id="ad-link" target="_blank">
                                <img id="ad-image" src="" alt="Publicidad" class="ad-modal-image">
                            </a>
                            <div class="ad-text">
                                <h4 id="ad-title"></h4>
                                <p id="ad-description"></p>
                            </div>
                        </div>
                        <div class="ad-footer">
                            <button id="ad-close-btn" class="ad-close-btn">Cerrar</button>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
        
        setupEventListeners() {
            // Cerrar modal con el botón X
            document.addEventListener('click', (e) => {
                if (e.target.classList.contains('ad-close') || e.target.id === 'ad-close-btn') {
                    this.hideAd();
                }
            });
            
            // Cerrar modal al hacer clic fuera del contenido
            document.addEventListener('click', (e) => {
                if (e.target.id === 'ad-modal') {
                    this.hideAd();
                }
            });
            
            // Cerrar con la tecla Escape
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && document.getElementById('ad-modal').style.display === 'block') {
                    this.hideAd();
                }
            });
            
            // Mostrar publicidad al hacer scroll (70% de la página)
            window.addEventListener('scroll', () => {
                const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
                
                if (scrollPercent > this.scrollThreshold && !this.adShown) {
                    this.showAd();
                    this.adShown = true;
                }
            });
        }
        
        scheduleAd() {
            // Limpiar timer existente si hay uno
            if (this.adTimer) {
                clearTimeout(this.adTimer);
            }
            
            // Mostrar publicidad después de 30 segundos
            this.adTimer = setTimeout(() => {
                if (!this.adShown) {
                    this.showAd();
                    this.adShown = true;
                }
            }, 30000);
        }
        
        // Función para obtener un índice aleatorio que no sea el mismo que el anterior
        getRandomAdIndex() {
            if (this.ads.length <= 1) return 0;
            
            let newIndex;
            do {
                newIndex = Math.floor(Math.random() * this.ads.length);
            } while (newIndex === this.previousAdIndex && this.ads.length > 1);
            
            this.previousAdIndex = newIndex;
            return newIndex;
        }
        
        showAd() {
            // Seleccionar un anuncio aleatorio que no sea el mismo que el anterior
            const randomIndex = this.getRandomAdIndex();
            const ad = this.ads[randomIndex];
            
            // Actualizar el DOM con el anuncio actual
            document.getElementById('ad-image').src = ad.image;
            document.getElementById('ad-link').href = ad.link;
            document.getElementById('ad-title').textContent = ad.title;
            document.getElementById('ad-description').textContent = ad.description;
            
            // Mostrar el modal
            document.getElementById('ad-modal').style.display = 'block';
            document.body.style.overflow = 'hidden';
            
            // Programar cierre automático después de 15 segundos
            setTimeout(() => {
                if (document.getElementById('ad-modal').style.display === 'block') {
                    this.hideAd();
                }
            }, 15000);
        }
        
        hideAd() {
            document.getElementById('ad-modal').style.display = 'none';
            document.body.style.overflow = '';
            
            // Programar próximo anuncio después de 2 minutos
            setTimeout(() => {
                this.adShown = false;
                this.scheduleAd();
            }, 120000);
        }
    }

    // Inicializar el sistema de publicidad
    const adManager = new AdManager();
});