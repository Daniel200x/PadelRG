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
  

});

});