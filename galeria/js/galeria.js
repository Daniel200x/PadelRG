document.addEventListener('DOMContentLoaded', function() {
    // =============================================
    // Menú móvil (hamburger menu)
    // =============================================
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-links li');
    
    // Función para toggle del menú móvil
    const toggleMobileMenu = () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    };
    
    // Evento para el botón hamburger
    hamburger.addEventListener('click', toggleMobileMenu);
    
    // Cerrar menú al hacer click en un link (para móviles)
    navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        // Verificar si el clic fue en un dropdown o en su ícono
        const isDropdown = link.classList.contains('dropdown') || 
                          e.target.closest('.dropdown') || 
                          e.target.classList.contains('fa-chevron-down') || 
                          e.target.classList.contains('fa-chevron-up');
        
        if (navMenu.classList.contains('active') && !isDropdown) {
            toggleMobileMenu();
            }
        });
    });

    // =============================================
    // Dropdowns del menú
    // =============================================
    const dropdowns = document.querySelectorAll('.dropdown');
    
    dropdowns.forEach(dropdown => {
        const link = dropdown.querySelector('a');
        const menu = dropdown.querySelector('.dropdown-menu');
        const icon = link.querySelector('i');
        
        link.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) e.preventDefault();
            
            // Cerrar otros dropdowns
            dropdowns.forEach(other => {
                if (other !== dropdown) {
                    other.querySelector('.dropdown-menu').classList.remove('active');
                    other.querySelector('i').classList.replace('fa-chevron-up', 'fa-chevron-down');
                }
            });
            
            // Toggle dropdown actual
            menu.classList.toggle('active');
            
            // Cambiar ícono
            icon.classList.toggle('fa-chevron-down');
            icon.classList.toggle('fa-chevron-up');
        });
    });
    
    // Cerrar dropdowns al hacer click fuera
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown')) {
            dropdowns.forEach(dropdown => {
                dropdown.querySelector('.dropdown-menu').classList.remove('active');
                dropdown.querySelector('i').classList.replace('fa-chevron-up', 'fa-chevron-down');
            });
        }
    });

 // =============================================
    // Galería de álbumes - Carga automática desde carpetas
    // =============================================
    const filterButtons = document.querySelectorAll('.filter-btn');
    const albumsContainer = document.querySelector('.albums-container');
    const albumLightbox = document.querySelector('.album-lightbox');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxPrev = document.querySelector('.lightbox-prev');
    const lightboxNext = document.querySelector('.lightbox-next');
    const lightboxImage = document.querySelector('.lightbox-image');
    const lightboxTitle = document.querySelector('.lightbox-title');
    const lightboxCounter = document.querySelector('.lightbox-counter');
    const lightboxThumbnails = document.querySelector('.lightbox-thumbnails');
    
    // Estructura de carpetas de álbumes (ajusta estas rutas según tu estructura real)
    const albumFolders = {
      /*  'arenas': {
            title: 'Torneo Arena 2025',
            folder: '../img/gallery/arenas/',
           description: 'Imágenes del torneo realizado en Agosto 2025'
        },
*/      
        'punto-de-oro-mierc': {
            title: 'Torneo Punto de Oro 2025',
            folder: '../img/gallery/punto-de-oro-mierc/',
            description: 'Imágenes del 3er Oficial de Punto de Oro Dia Miercoles'
        },
          'punto-de-oro': {
            title: 'Torneo Punto de Oro 2025',
            folder: '../img/gallery/punto-de-oro/',
            description: 'Imágenes del 3er Oficial de Punto de Oro Dia Jueves'
        },
        'punto-de-oro-sab': {
            title: 'Torneo Punto de Oro 2025',
            folder: '../img/gallery/punto-de-oro-sab/',
            description: 'Imágenes del 3er Oficial de Punto de Oro Dia Sabado'
        },
        'punto-de-oro-dom': {
            title: 'Torneo Punto de Oro 2025',
            folder: '../img/gallery/punto-de-oro-dom/',
            description: 'Imágenes del 3er Oficial de Punto de Oro Dia Domingo'
        }
        ,
        'punto-de-oro-dom': {
            title: 'Torneo Punto de Oro 2025',
            folder: '../img/gallery/punto-de-oro-pares/',
            description: 'Imágenes del 3er Oficial de Punto de Oro Pares',
        externalLink: 'https://photos.app.goo.gl/yx4Q8SLknfKMRyVEA' // Añadir este campo
        }/*,
        'segundo-set': {
            title: 'Torneo 2do Set 2025',
            folder: '../img/gallery/segundo-set/',
            description: 'Imágenes del torneo realizado en Septiembre 2025'
        },
        'martin-gallardo': {
            title: 'Torneo Copa Challenger 2025',
            folder: '../img/gallery/martin-gallardo/',
            description: 'Imágenes del torneo realizado en Septiembre 2025'
        }*/
    };
    
    let currentAlbum = null;
    let currentImageIndex = 0;
    let albumImages = {}; // Aquí almacenaremos las imágenes encontradas

    // Inicializar la galería
    initGallery();

    async function initGallery() {
        // Cargar imágenes para cada álbum
        for (const [albumId, albumInfo] of Object.entries(albumFolders)) {
            try {
                const images = await loadAlbumImages(albumInfo.folder);
                albumImages[albumId] = images;
                
                // Crear elemento de álbum solo si hay imágenes
                if (images.length > 0) {
                    createAlbumElement(albumId, albumInfo, images);
                }
            } catch (error) {
                console.error(`Error cargando imágenes para ${albumId}:`, error);
            }
        }

        // Inicializar eventos después de crear los álbumes
        initEvents();
    }

    // Función para cargar imágenes de un álbum
    async function loadAlbumImages(folderPath) {
        // En GitHub Pages, podemos usar una técnica para obtener la lista de imágenes
        // Nota: Esto requiere que tengas un archivo index.json en cada carpeta o uses un enfoque alternativo
        
        // Como alternativa, podemos asumir una estructura de nombres de archivo
        // o usar una lista predefinida si sabemos los nombres
        
        // Esta es una solución temporal - en un entorno real necesitarías
        // un servidor que proporcione la lista de archivos
        const imageExtensions = ['.jpg','.JPG', '.jpeg', '.png', '.gif', '.webp'];
        const images = [];
        
        // Para GitHub Pages, una opción es tener un archivo JSON con la lista de imágenes
        try {
            const response = await fetch(`${folderPath}images.json`);
            if (response.ok) {
                const imageList = await response.json();
                return imageList.map(img => ({
                    src: `${folderPath}${img.filename}`,
                    caption: img.caption || ''
                }));
            }
        } catch (e) {
            // Si no hay images.json, usar nombres predefinidos
            console.log('No se encontró images.json, usando imágenes por defecto');
        }
        
        // Fallback: intentar cargar imágenes con nombres predecibles
        for (let i = 1; i <= 57; i++) {
            for (const ext of imageExtensions) {
                const imgPath = `${folderPath}${i}${ext}`;
                // No podemos verificar si existe realmente, pero podemos intentar
                images.push({
                    src: imgPath,
                    caption: `Imagen ${i}`
                });
                break; // Solo una extensión por número
            }
        }
        
        return images;
    }

    // Función para crear elemento de álbum
function createAlbumElement(albumId, albumInfo, images) {
    const albumEl = document.createElement('div');
    albumEl.className = `album ${albumId}`;
    
    // Usar las primeras imágenes como miniaturas de vista previa
    const previewImages = images.slice(0, 3);
    
    // Verificar si hay enlace externo
    const externalLinkHTML = albumInfo.externalLink ? 
        `<a href="${albumInfo.externalLink}" target="_blank" class="external-album-link">
            <i class="fas fa-external-link-alt"></i> Ver album completo
        </a>` : '';
    
    albumEl.innerHTML = `
        <h2 class="album-title">${albumInfo.title}</h2>
        <p class="album-description">${albumInfo.description}</p>
        <div class="album-preview">
            <div class="main-preview">
                <img src="${previewImages[0].src}" alt="${albumInfo.title}" data-index="0" />
            </div>
            <div class="thumbnails">
                ${previewImages.map((img, index) => 
                    `<img src="${img.src}" alt="Miniatura ${index + 1}" data-index="${index}" />`
                ).join('')}
            </div>
        </div>
        <div class="album-actions">
            <button class="view-album-btn" data-album="${albumId}">
                Ver álbum completo (${images.length} imágenes)
            </button>
            ${externalLinkHTML}
        </div>
    `;
    
    albumsContainer.appendChild(albumEl);
        
        // Añadir eventos a las miniaturas de este álbum
        const thumbnails = albumEl.querySelectorAll('.thumbnails img');
        const mainImage = albumEl.querySelector('.main-preview img');
        
        thumbnails.forEach(thumb => {
            thumb.addEventListener('click', function() {
                mainImage.src = this.src;
                mainImage.dataset.index = this.dataset.index;
            });
        });
        
        // Evento para la imagen principal
        mainImage.addEventListener('click', function() {
            openAlbum(albumId, parseInt(this.dataset.index));
        });
        
        // Evento para el botón
        albumEl.querySelector('.view-album-btn').addEventListener('click', function() {
            openAlbum(albumId);
        });
    }

 // Función para inicializar eventos
function initEvents() {
    // Filtrado de álbumes
    if (filterButtons) {
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                // Prevenir comportamiento por defecto en móviles
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                }
                
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                const filterValue = button.dataset.filter;
                document.querySelectorAll('.album').forEach(album => {
                    album.style.display = (filterValue === 'all' || album.classList.contains(filterValue)) 
                        ? 'block' 
                        : 'none';
                });
            });
        });
    }
    
    // Eventos del lightbox - Mejorados para touch
    if (lightboxPrev && lightboxNext) {
        // Para dispositivos táctiles
        lightboxPrev.addEventListener('touchstart', function(e) {
            e.preventDefault();
            showPrevImage();
        }, {passive: false});
        
        lightboxNext.addEventListener('touchstart', function(e) {
            e.preventDefault();
            showNextImage();
        }, {passive: false});
        
        // Para dispositivos con mouse
        lightboxPrev.addEventListener('click', showPrevImage);
        lightboxNext.addEventListener('click', showNextImage);
    }
    
    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
        lightboxClose.addEventListener('touchstart', function(e) {
            e.preventDefault();
            closeLightbox();
        }, {passive: false});
    }
    
    // Navegación por gestos táctiles en la imagen
    let touchStartX = 0;
    let touchEndX = 0;
    
    lightboxImage.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    }, {passive: true});
    
    lightboxImage.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, {passive: true});
    
    function handleSwipe() {
        const minSwipeDistance = 50; // Distancia mínima para considerar un swipe
        const distance = touchStartX - touchEndX;
        
        if (Math.abs(distance) < minSwipeDistance) return;
        
        if (distance > 0) {
            // Swipe izquierda - siguiente imagen
            showNextImage();
        } else {
            // Swipe derecha - imagen anterior
            showPrevImage();
        }
    }
    
    // Eventos de teclado
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && albumLightbox.classList.contains('active')) {
            closeLightbox();
        } else if (e.key === 'ArrowLeft' && albumLightbox.classList.contains('active')) {
            showPrevImage();
        } else if (e.key === 'ArrowRight' && albumLightbox.classList.contains('active')) {
            showNextImage();
        }
    });
    
    // Cerrar al hacer clic fuera de la imagen
    albumLightbox.addEventListener('click', function(e) {
        if (e.target === albumLightbox) {
            closeLightbox();
        }
    });
    
    // Prevenir zoom no deseado en dispositivos táctiles
    document.addEventListener('touchstart', function(e) {
        if (albumLightbox.classList.contains('active') && e.touches.length > 1) {
            e.preventDefault();
        }
    }, { passive: false });
}

   // Función para abrir un álbum
function openAlbum(albumId, startIndex = 0) {
    if (!albumImages[albumId] || albumImages[albumId].length === 0) return;
    
    currentAlbum = albumId;
    currentImageIndex = startIndex;
    
    // Actualizar lightbox
    updateLightboxImage();
    createThumbnails();
    
    // Mostrar lightbox
    albumLightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Centrar imagen después de cargar
    centerLightboxImage();
}

// Función para centrar la imagen en el lightbox
function centerLightboxImage() {
    const img = new Image();
    img.onload = function() {
        // La imagen ya se centra con CSS, pero podemos añadir lógica adicional si es necesario
        console.log("Imagen cargada correctamente");
    };
    img.src = lightboxImage.src;
}

// Añadir esta función al final del evento DOMContentLoaded
// Para manejar el redimensionamiento de la ventana
window.addEventListener('resize', function() {
    if (albumLightbox.classList.contains('active')) {
        centerLightboxImage();
    }
});
    
    // Actualizar imagen en el lightbox
    function updateLightboxImage() {
        const imageData = albumImages[currentAlbum][currentImageIndex];
        lightboxImage.src = imageData.src;
        lightboxTitle.textContent = albumFolders[currentAlbum].title;
        lightboxCounter.textContent = `${currentImageIndex + 1} / ${albumImages[currentAlbum].length}`;
        
        // Actualizar miniatura activa
        document.querySelectorAll('.lightbox-thumbnails img').forEach((img, index) => {
            img.classList.toggle('active', index === currentImageIndex);
        });
    }
    
    // Crear miniaturas para el lightbox
    function createThumbnails() {
        lightboxThumbnails.innerHTML = '';
        
        albumImages[currentAlbum].forEach((image, index) => {
            const thumb = document.createElement('img');
            thumb.src = image.src;
            thumb.alt = `Miniatura ${index + 1}`;
            thumb.classList.toggle('active', index === currentImageIndex);
            thumb.addEventListener('click', () => {
                currentImageIndex = index;
                updateLightboxImage();
            });
            
            lightboxThumbnails.appendChild(thumb);
        });
    }
    
    function showPrevImage() {
        if (currentImageIndex > 0) {
            currentImageIndex--;
        } else {
            currentImageIndex = albumImages[currentAlbum].length - 1;
        }
        updateLightboxImage();
    }
    
    function showNextImage() {
        if (currentImageIndex < albumImages[currentAlbum].length - 1) {
            currentImageIndex++;
        } else {
            currentImageIndex = 0;
        }
        updateLightboxImage();
    }
    
    function closeLightbox() {
        albumLightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    // =============================================
    // Año actual en el footer
    // =============================================
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
});