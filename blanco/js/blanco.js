document.addEventListener('DOMContentLoaded', function() {
    // Menú desplegable para móviles (hamburger menu)
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-links li');
    
    // Dropdowns del menú
    const dropdowns = document.querySelectorAll('.dropdown');
    
    // Año actual en el footer
    document.getElementById('current-year').textContent = new Date().getFullYear();
    
 
});


