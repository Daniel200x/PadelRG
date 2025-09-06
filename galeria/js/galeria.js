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
    // Galería de álbumes
    // =============================================
    const filterButtons = document.querySelectorAll('.filter-btn');
    const albums = document.querySelectorAll('.album');
    const viewAlbumButtons = document.querySelectorAll('.view-album-btn');
    const albumLightbox = document.querySelector('.album-lightbox');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxPrev = document.querySelector('.lightbox-prev');
    const lightboxNext = document.querySelector('.lightbox-next');
    const lightboxImage = document.querySelector('.lightbox-image');
    const lightboxTitle = document.querySelector('.lightbox-title');
    const lightboxCounter = document.querySelector('.lightbox-counter');
    const lightboxThumbnails = document.querySelector('.lightbox-thumbnails');
    
    // Datos de los álbumes (deberías expandir esto con todas tus imágenes)
    const albumData = {
        'arenas': {
            title: 'Torneo Arena 2025',
            images: [
                { src: '../img/gallery/1.jpg', caption: 'Final masculina - Octubre 2023' },
                { src: '../img/gallery/4.jpg', caption: 'Entrega de premios - Octubre 2023' },
                // Agrega más imágenes aquí
            ]
        },
        'punto-de-oro': {
            title: 'Torneo Punto de Oro 2025',
            images: [
                { src: '../img/gallery/21.jpg', caption: 'Semifinal femenina - Agosto 2023' },
                { src: '../img/gallery/22.jpg', caption: 'Partido emocionante - Agosto 2023' },
                // Agrega más imágenes aquí
            ]
        },
        'segundo-set': {
            title: 'Torneo 2do Set 2025',
            images: [
                { src: '../img/gallery/10.jpg', caption: 'Semifinal femenina - Agosto 2023' },
                { src: '../img/gallery/14.jpg', caption: 'Partido emocionante - Agosto 2023' },
                // Agrega más imágenes aquí
            ]
        },
        'martin-gallardo': {
            title: 'Torneo por equipos 2025',
            images: [
                { src: '../img/gallery/10.jpg', caption: 'Semifinal femenina - Agosto 2023' },
                { src: '../img/gallery/14.jpg', caption: 'Partido emocionante - Agosto 2023' },
                // Agrega más imágenes aquí
            ]
        },
        // Agregar más álbumes aquí
    };
    
    let currentAlbum = null;
    let currentImageIndex = 0;

    // Filtrado de álbumes
    if (filterButtons && albums) {
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Actualizar botón activo
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Filtrar álbumes
                const filterValue = button.dataset.filter;
                albums.forEach(album => {
                    album.style.display = (filterValue === 'all' || album.classList.contains(filterValue)) 
                        ? 'block' 
                        : 'none';
                });
            });
        });
    }
    
    // Cambiar imagen principal al hacer clic en miniaturas
    document.querySelectorAll('.thumbnails img').forEach(thumb => {
        thumb.addEventListener('click', function() {
            const albumPreview = this.closest('.album-preview');
            const mainImage = albumPreview.querySelector('.main-preview img');
            mainImage.src = this.src;
            mainImage.dataset.index = this.dataset.index;
        });
    });
    
    // Abrir lightbox de álbum
    if (viewAlbumButtons) {
        viewAlbumButtons.forEach(button => {
            button.addEventListener('click', function() {
                const albumId = this.dataset.album;
                openAlbum(albumId);
            });
        });
    }
    
    // También abrir álbum al hacer clic en la imagen principal
    document.querySelectorAll('.main-preview img').forEach(img => {
        img.addEventListener('click', function() {
            const albumId = this.closest('.album').classList[1]; // Obtiene la segunda clase que es el ID del álbum
            openAlbum(albumId, parseInt(this.dataset.index));
        });
    });
    
    // Función para abrir un álbum
    function openAlbum(albumId, startIndex = 0) {
        if (!albumData[albumId]) return;
        
        currentAlbum = albumId;
        currentImageIndex = startIndex;
        
        // Actualizar lightbox con la primera imagen
        updateLightboxImage();
        
        // Crear miniaturas
        createThumbnails();
        
        // Mostrar lightbox
        albumLightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    // Actualizar imagen en el lightbox
    function updateLightboxImage() {
        const imageData = albumData[currentAlbum].images[currentImageIndex];
        lightboxImage.src = imageData.src;
        lightboxTitle.textContent = albumData[currentAlbum].title;
        lightboxCounter.textContent = `${currentImageIndex + 1} / ${albumData[currentAlbum].images.length}`;
        
        // Actualizar miniatura activa
        document.querySelectorAll('.lightbox-thumbnails img').forEach((img, index) => {
            img.classList.toggle('active', index === currentImageIndex);
        });
    }
    
    // Crear miniaturas para el lightbox
    function createThumbnails() {
        lightboxThumbnails.innerHTML = '';
        
        albumData[currentAlbum].images.forEach((image, index) => {
            const thumb = document.createElement('img');
            thumb.src = image.src.replace('.jpg', '-thumb.jpg');
            thumb.alt = `Miniatura ${index + 1}`;
            thumb.classList.toggle('active', index === currentImageIndex);
            thumb.addEventListener('click', () => {
                currentImageIndex = index;
                updateLightboxImage();
            });
            
            lightboxThumbnails.appendChild(thumb);
        });
    }
    
    // Navegación en el lightbox
    if (lightboxPrev && lightboxNext) {
        lightboxPrev.addEventListener('click', showPrevImage);
        lightboxNext.addEventListener('click', showNextImage);
    }
    
    function showPrevImage() {
        if (currentImageIndex > 0) {
            currentImageIndex--;
        } else {
            currentImageIndex = albumData[currentAlbum].images.length - 1;
        }
        updateLightboxImage();
    }
    
    function showNextImage() {
        if (currentImageIndex < albumData[currentAlbum].images.length - 1) {
            currentImageIndex++;
        } else {
            currentImageIndex = 0;
        }
        updateLightboxImage();
    }
    
    // Cerrar lightbox
    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }
    
    function closeLightbox() {
        albumLightbox.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    // Cerrar con tecla ESC
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
    // =============================================
    // Año actual en el footer
    // =============================================
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    // =============================================
    // Ajustar altura de los items de la galería
    // =============================================
   
    
  
});