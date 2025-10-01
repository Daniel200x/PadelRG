// Función para crear slugs (URLs amigables) a partir de títulos
function createSlug(title) {
    return title
        .toLowerCase()
        .normalize('NFD') // Separar acentos
        .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
        .replace(/[^a-z0-9 -]/g, '') // Eliminar caracteres no alfanuméricos
        .replace(/\s+/g, '-') // Reemplazar espacios con guiones
        .replace(/-+/g, '-') // Reemplazar múltiples guiones con uno solo
        .trim('-');
}



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

    // Sistema de noticias dinámicas
    const newsContainer = document.getElementById('news-container');
    const pagination = document.getElementById('pagination');
    const prevBtnNews = document.getElementById('prev-btn');
    const nextBtnNews = document.getElementById('next-btn');
    const pageNumbers = document.getElementById('page-numbers');
    
    let currentPage = 1;
    const newsPerPage = 3;
    let allNews = [];
    
 // Función para cargar noticias desde JSON externo
async function loadNews() {
    try {
        const response = await fetch('data/news.json');
        if (!response.ok) {
            throw new Error('Error al cargar las noticias');
        }
        const data = await response.json();
        
        // Ordenar noticias por fecha (más recientes primero) - ESTA PARTE FALTABA
        allNews = data.news.sort((a, b) => {
            return new Date(b.timestamp) - new Date(a.timestamp);
        });
        
        displayNews();
        setupPagination();
        handleHashAnchor(); // Verificar si hay ancla en la URL
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
            newsCard.id = `noticia-${news.id}`;
            
            // URL base para compartir (la página principal)
            const baseUrl = window.location.href.split('?')[0]; // Remover parámetros existentes
            const slug = createSlug(news.title);
const shareUrl = `${baseUrl}#noticia-${slug}`;
            const shareText = `Mira esta noticia de Pádel RG: ${news.title}`;
            
            newsCard.innerHTML = `
                <div class="news-image">
                    <img src="${news.image}" alt="${news.alt}" loading="lazy">
                </div>
                <div class="news-content">
                    <span class="news-date">${news.date}</span>
                    <h3>${news.title}</h3>
                    <p>${news.summary}</p>
                    
                    <div class="news-actions">
                        <a href="#" class="news-link" data-id="${news.id}">
                            Leer más <i class="fas fa-arrow-right"></i>
                        </a>
                        
                        <div class="share-buttons">
                            <!-- Botón de compartir en Facebook -->
                            <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}" 
                               target="_blank" 
                               class="share-button facebook-share"
                               title="Compartir en Facebook"
                               onclick="return !window.open(this.href, 'Facebook', 'width=640,height=580')">
                               <i class="fab fa-facebook-f"></i>
                            </a>
                            
                            <!-- Botón para compartir en WhatsApp -->
                            <a href="https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}" 
                               target="_blank" 
                               class="share-button whatsapp-share"
                               title="Compartir en WhatsApp"
                               onclick="return !window.open(this.href, 'WhatsApp', 'width=640,height=580')">
                               <i class="fab fa-whatsapp"></i>
                            </a>

                           

                            <!-- Botón para copiar enlace -->
                            <button class="share-button copy-share"
                                    title="Copiar enlace"
                                    data-url="${shareUrl}">
                                <i class="fas fa-link"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            newsContainer.appendChild(newsCard);
        });

        // Agregar event listener para el botón de copiar
        document.querySelectorAll('.copy-share').forEach(button => {
            button.addEventListener('click', function() {
                const url = this.getAttribute('data-url');
                copyToClipboard(url);
            });
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
                handlePageChange(1);
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
                handlePageChange(i);
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
                handlePageChange(pageCount);
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
    
    // Función para manejar el cambio de página
    async function handlePageChange(newPage) {
        // Mostrar loader
        newsContainer.innerHTML = '<div class="news-loader">Cargando noticias...</div>';
        
        currentPage = newPage;
        
        // Pequeña pausa para permitir el renderizado
        await new Promise(resolve => setTimeout(resolve, 50));
        
        displayNews();
        updatePaginationButtons();
        
        // Scroll a la primera noticia en móviles
        if (window.innerWidth <= 768) {
            scrollToFirstNews();
        }
    }
    
    // Función para hacer scroll a la primera noticia
    function scrollToFirstNews() {
        const firstNewsCard = document.querySelector('.news-card');
        if (firstNewsCard) {
            // Calculamos posición considerando el menú fijo
            const headerOffset = 80;
            const elementPosition = firstNewsCard.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.scrollY - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    }
    
    // Event listeners para botones Anterior/Siguiente
    prevBtnNews.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage > 1) {
            handlePageChange(currentPage - 1);
        }
    });

    nextBtnNews.addEventListener('click', (e) => {
        e.preventDefault();
        const pageCount = Math.ceil(allNews.length / newsPerPage);
        if (currentPage < pageCount) {
            handlePageChange(currentPage + 1);
        }
    });
    
    // Modal para noticia completa
  // Buscar esta función en tu script.js y reemplazarla
function showFullNews(newsId) {
    const news = allNews.find(item => item.id === newsId);
    if (!news) return;
    
    const baseUrl = window.location.href.split('?')[0];
    const slug = createSlug(news.title);
const shareUrl = `${baseUrl}#noticia-${slug}`;
    const shareText = `Mira esta noticia de Pádel RG: ${news.title}`;
    
    // Procesar el contenido para dividir en párrafos
    const contentParagraphs = news.fullContent.split('\n\n')
        .map(paragraph => {
            // Si el párrafo está vacío, ignorarlo
            if (!paragraph.trim()) return '';
            // Crear un párrafo con el contenido
            return `<p>${paragraph}</p>`;
        })
        .join('');
    
    const modal = document.createElement('div');
    modal.className = 'news-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <button class="modal-close">&times;</button>
                <h3 class="modal-title">${news.title}</h3>
                <span class="modal-date">${news.date}</span>
                
                <div class="modal-share-buttons">
                    <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}" 
                       target="_blank" 
                       class="share-button facebook-share"
                       title="Compartir en Facebook"
                       onclick="return !window.open(this.href, 'Facebook', 'width=640,height=580')">
                       <i class="fab fa-facebook-f"></i>
                    </a>
                    
                    <a href="https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}" 
                       target="_blank" 
                       class="share-button whatsapp-share"
                       title="Compartir en WhatsApp"
                       onclick="return !window.open(this.href, 'WhatsApp', 'width=640,height=580')">
                       <i class="fab fa-whatsapp"></i>
                    </a>

                    <button class="share-button copy-share"
                            title="Copiar enlace"
                            data-url="${shareUrl}">
                        <i class="fas fa-link"></i>
                    </button>
                </div>
            </div>
            <div class="modal-body">
                <img src="${news.image}" alt="${news.alt}" class="modal-image">
                ${contentParagraphs}
                <div class="modal-footer">
                    <button class="btn modal-btn">Cerrar</button>
                </div>
            </div>
        </div>
    `;
    
    // El resto del código permanece igual...
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
    modal.style.display = 'block';
    
    // Agregar event listener para copiar en el modal
    const copyButton = modal.querySelector('.copy-share');
    copyButton.addEventListener('click', function() {
        const url = this.getAttribute('data-url');
        copyToClipboard(url);
    });
    
    // Cerrar modal
    const closeBtn = modal.querySelector('.modal-close');
    const closeBtnFooter = modal.querySelector('.modal-btn');
    
    const closeModal = () => {
        document.body.removeChild(modal);
        document.body.style.overflow = '';
    };
    
    closeBtn.addEventListener('click', closeModal);
    closeBtnFooter.addEventListener('click', closeModal);
    
    // Cerrar al hacer clic fuera del contenido o presionar ESC
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
}
    // Función para copiar al portapapeles
    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            // Mostrar mensaje de confirmación
            showNotification('Enlace copiado al portapapeles');
        }).catch(err => {
            console.error('Error al copiar: ', err);
            showNotification('Error al copiar el enlace', 'error');
        });
    }
    
    // Función para mostrar notificación
    function showNotification(message, type = 'success') {
        // Crear elemento de notificación
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Estilos para la notificación
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#27ae60' : '#e74c3c'};
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 10px;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Remover después de 3 segundos
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
    
 
    // Manejar anclas en la URL (para cuando compartan con #noticia-slug)
function handleHashAnchor() {
    const hash = window.location.hash;
    if (hash.startsWith('#noticia-')) {
        const slug = hash.replace('#noticia-', '');
        
        // Buscar la noticia por slug
        const news = allNews.find(item => {
            const newsSlug = createSlug(item.title);
            return newsSlug === slug;
        });
        
        if (news) {
            // Esperar a que se carguen las noticias
            setTimeout(() => {
                showFullNews(news.id);
            }, 500);
        }
    }
}
    
    // Ejecutar cuando se carga la página y cuando cambia el hash
    window.addEventListener('load', handleHashAnchor);
    window.addEventListener('hashchange', handleHashAnchor);
    
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
                image: 'img/publi/pino.jpeg',
                link: 'https://www.instagram.com/padelpino/',
                title: 'Padel Pino',
                description: 'Clases de Padel personalizadas para todos los niveles, comunicate al 2964-474217 y no te olvides de seguirnos en Instagram @padelpino.'
            }
            ,
            {
                image: 'img/publi/fritz.jpeg',
                link: 'https://www.instagram.com/fritzautomotores/',
                title: 'Fritz Automotores',
                description: 'Fritz Automotores. Servicios de venta automotor y gestoria, comunicate con nosotros al 2964-600301 y no olvides de seguirnos en redes @fritzautomotores'
            }
            
            
            
            ,
            {
                image: 'img/publi/kira.jpeg',
                link: 'https://www.instagram.com/kira.tdf/',
                title: 'Kira Store',
                description: 'Tendencia, estilo y comodidad: Todo en Kira Store. Ropa femenina con promos exclusivas, 3 cuotas sin interes o descuentos en efectivo/transferencia. Te Esperamos en Viedma 445 y en redes como @kira.tdf ❤️'
            },
            {
                image: 'img/publi/coren.jpg',
                link: 'https://www.instagram.com/corenindumentaria/',
                title: 'Coren Indumentaria',
                description: '"Técnica mata Galan.." 😉 ... pero con el outfit correcto, cualquiera puede ganar. Coren indumentaria, toda la ropa de los PRO en un solo lugar. Seguinos en Instagram y enterate de todas las novedades! @corenindumentaria'
            },
            {
                image: 'img/publi/fixg.jpg',
                link: 'https://www.instagram.com/fixcar369/',
                title: 'Fix - Car - Mecanica Integral',
                description: 'Necesitas mecanico? Contactanos al 2964-629986. Realizamos Service, diagnosticos, transmision, frenos, distribucion y mucho mas. Podes encontrarnos en Pasaje Roca 1266 en nuestro horario de atención de 10:00 a 21:30 hs.'
            },
                {
                image: 'img/publi/muebles.jpeg',
                link: 'https://www.instagram.com/rpamoblamientos.tdf?igsh=dTNrcHEwNndmeGF4',
                title: 'RPA Amoblamientos',
                description: 'Los mejores muebles para tu hogar en Tierra del Fuego. Calidad y diseño en cada pieza.'
            },
            {
                image: 'img/publi/trexx.jpeg',
                link: 'https://www.instagram.com/trexx.tdf?igsh=cXNqYnJsNzV1NG5w',
                title: 'Trexx TDF',
                description: 'Encontra las mejores palas, indumentaria, pelotas y accesorios para tu juego. ¡Distribuidor oficial de Trexx en TDF!'
            },
            {
                image: 'img/publi/coren.jpg',
                link: 'https://www.instagram.com/corenindumentaria/',
                title: 'Coren Indumentaria',
                description: '"Técnica mata Galan.." 😉 ... pero con el outfit correcto, cualquiera puede ganar. Coren indumentaria, toda la ropa de los PRO en un solo lugar. Seguinos en Instagram y enterate de todas las novedades! @corenindumentaria'
            },
             {
                image: 'img/publi/pino.jpeg',
                link: 'https://www.instagram.com/padelpino/',
                title: 'Padel Pino',
                description: 'Clases de Padel personalizadas para todos los niveles, comunicate al 2964-474217 y no te olvides de seguirnos en Instagram @padelpino.'
            },
            {
                image: 'img/publi/kira.jpeg',
                link: 'https://www.instagram.com/kira.tdf/',
                title: 'Kira Store',
                description: 'Tendencia, estilo y comodidad: Todo en Kira Store. Ropa femenina con promos exclusivas, 3 cuotas sin interes o descuentos en efectivo/transferencia. Te Esperamos en Viedma 445 y en redes como @kira.tdf ❤️'
            },
            {
                image: 'img/publi/fritz.jpeg',
                link: 'https://www.instagram.com/fritzautomotores/',
                title: 'Fritz Automotores',
                description: 'Fritz Automotores. Servicios de venta automotor y gestoria, comunicate con nosotros al 2964-600301 y no olvides de seguirnos en redes @fritzautomotores'
            },
            {
                image: 'img/publi/fixg.jpg',
                link: 'https://www.instagram.com/fixcar369/',
                title: 'Fix - Car - Mecanica Integral',
                description: 'Necesitas mecanico? Contactanos al 2964-629986. Realizamos Service, diagnosticos, transmision, frenos, distribucion y mucho mas. Podes encontrarnos en Pasaje Roca 1266 en nuestro horario de atención de 10:00 a 21:30 hs.'
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

// Añade esto al final de tu archivo script.js, antes del cierre });

// Función para mejorar el SEO con microdatos
function addMicrodata() {
  // Agregar microdatos a la organización
  const body = document.querySelector('body');
  body.setAttribute('itemscope', '');
  body.setAttribute('itemtype', 'https://schema.org/SportsOrganization');
  
  // Agregar microdatos al logo
  const logo = document.querySelector('.nav-logo img');
  if (logo) {
    logo.setAttribute('itemprop', 'logo');
  }
  
  // Agregar microdatos al nombre
  const siteName = document.querySelector('.header h1');
  if (siteName) {
    siteName.setAttribute('itemprop', 'name');
  }
  
  // Agregar microdatos a la descripción
  const description = document.querySelector('.header p');
  if (description) {
    description.setAttribute('itemprop', 'description');
  }
}

// Llamar a la función cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
  addMicrodata();
  
  // ... el resto de tu código existente ...
});

});