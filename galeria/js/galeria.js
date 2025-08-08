document.addEventListener('DOMContentLoaded', function() {
    // Menú desplegable para móviles (hamburger menu)
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-links li');
    
    // Dropdowns del menú
    const dropdowns = document.querySelectorAll('.dropdown');
    
    // Año actual en el footer
    document.getElementById('current-year').textContent = new Date().getFullYear();
    
    // Función para toggle del menú móvil
    function toggleMobileMenu() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    }
    
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
    
    // Manejo de dropdowns
    dropdowns.forEach(dropdown => {
        const link = dropdown.querySelector('a');
        const menu = dropdown.querySelector('.dropdown-menu');
        
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Cerrar otros dropdowns abiertos
            dropdowns.forEach(otherDropdown => {
                if (otherDropdown !== dropdown) {
                    otherDropdown.querySelector('.dropdown-menu').classList.remove('active');
                    otherDropdown.querySelector('a i').classList.remove('fa-chevron-up');
                    otherDropdown.querySelector('a i').classList.add('fa-chevron-down');
                }
            });
            
            // Toggle dropdown actual
            menu.classList.toggle('active');
            
            // Cambiar ícono
            const icon = link.querySelector('i');
            if (menu.classList.contains('active')) {
                icon.classList.remove('fa-chevron-down');
                icon.classList.add('fa-chevron-up');
            } else {
                icon.classList.remove('fa-chevron-up');
                icon.classList.add('fa-chevron-down');
            }
        });
    });
    
    // Cerrar dropdowns al hacer click fuera
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown')) {
            dropdowns.forEach(dropdown => {
                dropdown.querySelector('.dropdown-menu').classList.remove('active');
                dropdown.querySelector('a i').classList.remove('fa-chevron-up');
                dropdown.querySelector('a i').classList.add('fa-chevron-down');
            });
        }
    });
});

