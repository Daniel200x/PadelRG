// menu.js - Versión optimizada
document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-links > li > a:not(.dropdown-menu a)');
    const dropdownToggles = document.querySelectorAll('.dropdown > a');
    
    // Función para alternar el menú móvil
    function toggleMenu() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.classList.toggle('menu-open');
        
        // Cerrar todos los submenús al abrir/cerrar el menú principal
        if (!navMenu.classList.contains('active')) {
            document.querySelectorAll('.dropdown-menu').forEach(menu => {
                menu.classList.remove('active');
            });
        }
    }
    
    // Función para alternar submenús en móvil
    function toggleDropdown(e) {
        if (window.innerWidth <= 992) {
            e.preventDefault();
            const dropdown = this.parentElement;
            const dropdownMenu = this.nextElementSibling;
            
            // Cerrar otros dropdowns abiertos
            document.querySelectorAll('.dropdown-menu').forEach(menu => {
                if (menu !== dropdownMenu) menu.classList.remove('active');
            });
            
            dropdownMenu.classList.toggle('active');
        }
    }
    
    // Event Listeners
    hamburger.addEventListener('click', toggleMenu);
    
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', toggleDropdown);
    });
    
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 992) {
                toggleMenu(); // Cierra el menú al hacer clic en un enlace
            }
        });
    });
    
    // Cerrar menú al hacer clic fuera
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 992 && 
            !e.target.closest('.nav-container') && 
            navMenu.classList.contains('active')) {
            toggleMenu();
        }
    });
    
    // Cerrar menú al cambiar el tamaño de la pantalla
    window.addEventListener('resize', function() {
        if (window.innerWidth > 992 && navMenu.classList.contains('active')) {
            toggleMenu();
        }
    });
});