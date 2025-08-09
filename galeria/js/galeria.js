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
    // Galería de imágenes
    // =============================================
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const galleryGrid = document.querySelector('.gallery-grid');
    
    // Filtrado de imágenes
    if (filterButtons && galleryItems) {
        filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Actualizar botón activo
                filterButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Filtrar elementos
                const filterValue = button.dataset.filter;
                galleryItems.forEach(item => {
                    item.style.display = (filterValue === 'all' || item.classList.contains(filterValue)) 
                        ? 'block' 
                        : 'none';
                });
            });
        });
    }
    
    // Inicializar lightGallery (versión simplificada)
    if (galleryGrid) {
        lightGallery(galleryGrid, {
            selector: '.gallery-item',
            download: false,
            counter: false,
            speed: 400,
            thumbnail: true,
            animateThumb: false,
            showThumbByDefault: false
        });
    }

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
    const adjustGalleryItems = () => {
        if (galleryItems.length > 0) {
            const width = galleryItems[0].offsetWidth;
            galleryItems.forEach(item => {
                item.style.height = `${width}px`;
            });
        }
    };
    
    // Ejecutar al cargar y al redimensionar
    window.addEventListener('load', adjustGalleryItems);
    window.addEventListener('resize', adjustGalleryItems);
});