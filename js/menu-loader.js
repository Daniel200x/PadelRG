// menu-loader.js
function loadMenu() {
  fetch('/menu.html')
    .then(response => {
      if (!response.ok) {
        throw new Error('No se pudo cargar el menú');
      }
      return response.text();
    })
    .then(data => {
      // Insertar el menú en el elemento con id "menu-container"
      document.getElementById('menu-container').innerHTML = data;
      
      // Inicializar funcionalidad del menú
      initMenuFunctionality();
    })
    .catch(error => {
      console.error('Error cargando el menú:', error);
      // Crear un menú básico de respaldo
      createFallbackMenu();
    });
}

function initMenuFunctionality() {
  // Menú móvil
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');
  const dropdowns = document.querySelectorAll('.dropdown');

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', function() {
      this.classList.toggle('active');
      navMenu.classList.toggle('active');
    });
  }

  // Cerrar menú al hacer clic en un enlace (solo móviles)
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', function(e) {
      if (window.innerWidth <= 992) {
        // Solo para móviles
        if (this.parentElement.classList.contains('dropdown')) {
          e.preventDefault();
          const dropdownMenu = this.nextElementSibling;
          if (dropdownMenu) {
            dropdownMenu.classList.toggle('active');
          }
        } else {
          if (hamburger) hamburger.classList.remove('active');
          if (navMenu) navMenu.classList.remove('active');
        }
      }
    });
  });

  // Cerrar menú al hacer clic fuera
  document.addEventListener('click', function(e) {
    if (window.innerWidth <= 992 && !e.target.closest('.nav-container')) {
      if (hamburger) hamburger.classList.remove('active');
      if (navMenu) navMenu.classList.remove('active');
      document.querySelectorAll('.dropdown-menu').forEach(menu => {
        menu.classList.remove('active');
      });
    }
  });

  // Dropdowns para desktop (hover)
  if (window.innerWidth > 992) {
    dropdowns.forEach(dropdown => {
      dropdown.addEventListener('mouseenter', function() {
        this.querySelector('.dropdown-menu').classList.add('active');
      });
      
      dropdown.addEventListener('mouseleave', function() {
        this.querySelector('.dropdown-menu').classList.remove('active');
      });
    });
  }
}

function createFallbackMenu() {
  const fallbackMenu = `
    <nav class="main-nav">
      <div class="nav-container">
        <div class="nav-logo">
          <a href="/index.html">
            <img src="/img/logo1.png" alt="Pádel RG Logo" />
          </a>
        </div>
        <div class="nav-menu">
          <ul class="nav-links">
            <li><a href="/index.html">Inicio</a></li>
            <li><a href="/puntoDeOro/puntoDeOro.html">Torneos</a></li>
            <li><a href="/ranking/ranking.html">Ranking</a></li>
            <li><a href="/galeria/galeria.html">Galería</a></li>
            <li><a href="/contacto/contacto.html">Contacto</a></li>
          </ul>
        </div>
      </div>
    </nav>
  `;
  document.getElementById('menu-container').innerHTML = fallbackMenu;
}

// Cargar el menú cuando el DOM esté listo
if (document.getElementById('menu-container')) {
  document.addEventListener('DOMContentLoaded', loadMenu);
}