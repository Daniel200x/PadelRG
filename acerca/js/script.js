document.addEventListener('DOMContentLoaded', function() {
    
  
    
  
   

  

  


    // Actualizar año del footer
    document.getElementById('current-year').textContent = new Date().getFullYear();

  

    // Sistema de publicidad personalizada - VERSIÓN CORREGIDA
    class AdManager {
        constructor() {
            this.ads = [
            {
                image: '../img/publi/publi.jpg',
                link: '',
                title: 'Tu publicidad acá',
                description: 'Publicita tu producto con nosotros.'
            },
                {
                image: '../img/publi/muebles.jpeg',
                link: 'https://www.instagram.com/rpamoblamientos.tdf?igsh=dTNrcHEwNndmeGF4',
                title: 'RPA Amoblamientos',
                description: 'Los mejores muebles para tu hogar en Tierra del Fuego. Calidad y diseño en cada pieza.'
            },
            {
                image: '../img/publi/tienda.jpg',
                link: '',
                title: 'Tienda de Pádel',
                description: 'Encuentra las mejores palas, pelotas y accesorios para tu juego. ¡Ofertas especiales!'
            },
            {
                image: '../img/publi/publi.jpg',
                link: '',
                title: 'Tu publicidad acá',
                description: 'Publicita tu producto con nosotros.'
            },
            {
                image: '../img/publi/clases.jpg',
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