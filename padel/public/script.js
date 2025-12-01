// ============================================
// PÁDEL FUEGO - SCRIPT PRINCIPAL COMPLETO
// VERSIÓN CON IMÁGENES REALES - SIN PLACEHOLDERS
// ============================================

// 1. DECLARAR TODAS LAS FUNCIONES PRIMERO
// ============================================

// Función de notificación
function showNotification(message, type = 'success') {
    console.log(`[${type.toUpperCase()}] ${message}`);
    
    const notification = document.createElement('div');
    notification.className = 'notification ' + type;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#2c5530' : 
                     type === 'error' ? '#ff4444' : 
                     type === 'warning' ? '#ff9800' : '#2196F3'};
        color: white;
        padding: 12px 20px;
        border-radius: 5px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Función para manejar errores de imágenes
function handleImageError(imgElement, productName) {
    console.warn(`Imagen no encontrada: ${imgElement.src}`);
    
    // Usar imagen por defecto local
    imgElement.src = '/images/default-product.jpg';
    imgElement.alt = productName;
    imgElement.onerror = null; // Prevenir loops
    
    // Si la imagen por defecto también falla, usar un ícono simple
    imgElement.onerror = function() {
        imgElement.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200"><rect width="300" height="200" fill="%232c5530"/><text x="50%" y="50%" font-family="Arial" font-size="14" fill="white" text-anchor="middle" dy=".3em">' + encodeURIComponent(productName.substring(0, 25)) + '</text></svg>';
        imgElement.style.objectFit = 'cover';
    };
}

function formatRating(rating) {
    if (rating === undefined || rating === null) return '0.0';
    const num = Number(rating);
    return isNaN(num) ? '0.0' : num.toFixed(1);
}

function getRatingStars(rating) {
    const num = Number(rating) || 0;
    const fullStars = Math.floor(num);
    let stars = '';
    for (let i = 0; i < 5; i++) {
        stars += i < fullStars ? '⭐' : '☆';
    }
    return stars;
}

function getStockMessage(stock) {
    const num = Number(stock) || 0;
    if (num > 10) return '✓ En stock';
    if (num > 0) return `⚠️ Solo ${num} unidades`;
    return '✗ Sin stock';
}

// Función para mostrar productos
function displayProduct(product) {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;
    
    const safeProduct = {
        id: product.id || 'unknown',
        name: product.name || 'Producto sin nombre',
        brand: product.brand || 'Marca no especificada',
        description: product.description || 'Sin descripción',
        price: Number(product.price) || 0,
        stock: Number(product.stock) || 0,
        rating: Number(product.rating) || 0,
        imageUrl: product.imageUrl || '/images/default-product.jpg'
    };
    
    const productCard = document.createElement('div');
    productCard.className = 'product-card';
    productCard.innerHTML = `
        <div class="product-image">
            <img src="${safeProduct.imageUrl}" 
                 alt="${safeProduct.name}"
                 loading="lazy"
                 onerror="handleImageError(this, '${safeProduct.name.replace(/'/g, "\\'")}')">
        </div>
        <h3>${safeProduct.name}</h3>
        <p class="brand">${safeProduct.brand}</p>
        <p class="description">${safeProduct.description.substring(0, 80)}${safeProduct.description.length > 80 ? '...' : ''}</p>
        <div class="price">$${safeProduct.price.toLocaleString('es-AR')}</div>
        <div class="stock ${safeProduct.stock > 10 ? 'in-stock' : safeProduct.stock > 0 ? 'low-stock' : 'no-stock'}">
            ${getStockMessage(safeProduct.stock)}
        </div>
        <div class="rating">${getRatingStars(safeProduct.rating)} ${formatRating(safeProduct.rating)}/5</div>
        <button class="add-to-cart" onclick="addToCart('${safeProduct.id}')" 
                ${safeProduct.stock === 0 ? 'disabled' : ''}>
            ${safeProduct.stock === 0 ? 'Sin stock' : 'Agregar al Carrito'}
        </button>
    `;
    
    productsGrid.appendChild(productCard);
}

// Función para cargar productos locales (fallback)
function loadLocalProducts() {
    console.log('📦 Usando productos locales de demostración');
    
    const localProducts = [
        {
            id: '1',
            name: 'Pala Bullpadel Vertex 03',
            description: 'Pala de potencia media-alta, ideal para jugadores intermedios',
            price: 89990,
            brand: 'Bullpadel',
            stock: 15,
            rating: 4.5,
            imageUrl: '/images/products/pala-bullpadel-vertex.jpg'
        },
        {
            id: '2',
            name: 'Pala Head Alpha Pro',
            description: 'Control máximo para jugadores avanzados',
            price: 75990,
            brand: 'Head',
            stock: 8,
            rating: 4.3,
            imageUrl: '/images/products/pala-head-alpha.jpg'
        },
        {
            id: '3',
            name: 'Pelotas Head Padel Pro',
            description: 'Tubo de 3 pelotas profesionales',
            price: 12990,
            brand: 'Head',
            stock: 50,
            rating: 4.7,
            imageUrl: '/images/products/pelotas-head.jpg'
        },
        {
            id: '4',
            name: 'Mochila Bullpadel Advance',
            description: 'Mochila con compartimento térmico para 2 palas',
            price: 34990,
            brand: 'Bullpadel',
            stock: 12,
            rating: 4.2,
            imageUrl: '/images/products/mochila-bullpadel.jpg'
        },
        {
            id: '5',
            name: 'Zapatos Asics Gel-Padel Pro',
            description: 'Calzado profesional con tecnología GEL',
            price: 55990,
            brand: 'Asics',
            stock: 6,
            rating: 4.6,
            imageUrl: '/images/products/zapatos-asics.jpg'
        },
        {
            id: '6',
            name: 'Overgrips Tecnifibre',
            description: 'Pack de 10 overgrips absorbentes',
            price: 8990,
            brand: 'Tecnifibre',
            stock: 45,
            rating: 4.4,
            imageUrl: '/images/products/overgrips-tecnifibre.jpg'
        }
    ];
    
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;
    
    productsGrid.innerHTML = '';
    localProducts.forEach(product => displayProduct(product));
    
    showNotification('Mostrando productos de demostración', 'info');
}

// Función principal para cargar productos
async function loadProducts() {
    console.log('🔄 Cargando productos...');
    
    try {
        const productsGrid = document.getElementById('products-grid');
        if (!productsGrid) return;
        
        productsGrid.innerHTML = '<div class="loading">Cargando productos...</div>';
        
        // Verificar si Firebase está disponible
        if (!window.db) {
            console.log('⚠️ Firebase no disponible, usando datos locales');
            loadLocalProducts();
            return;
        }
        
        console.log('🔍 Intentando cargar desde Firestore...');
        
        // Usar una consulta más simple para evitar el error de índice
        try {
            const querySnapshot = await window.db.collection('products').get();
            
            console.log(`📊 Encontrados: ${querySnapshot.size} productos`);
            
            if (querySnapshot.empty) {
                console.log('📦 No hay productos en Firestore');
                loadLocalProducts();
                return;
            }
            
            productsGrid.innerHTML = '';
            let activeProducts = 0;
            
            querySnapshot.forEach(doc => {
                const product = doc.data();
                // Filtrar productos activos manualmente
                if (product.isActive !== false) {
                    displayProduct({
                        id: doc.id,
                        ...product
                    });
                    activeProducts++;
                }
            });
            
            if (activeProducts === 0) {
                console.log('📦 No hay productos activos');
                loadLocalProducts();
            } else {
                console.log(`✅ ${activeProducts} productos cargados`);
            }
            
        } catch (firestoreError) {
            console.error('❌ Error de Firestore:', firestoreError);
            showNotification('Usando productos locales temporalmente', 'warning');
            loadLocalProducts();
        }
        
    } catch (error) {
        console.error('❌ Error general cargando productos:', error);
        showNotification('Error cargando productos', 'error');
        loadLocalProducts();
    }
}

// Funciones del carrito
let cart = [];

function updateCartCounter() {
    let counter = document.getElementById('cart-counter');
    
    if (!counter) {
        counter = document.createElement('span');
        counter.id = 'cart-counter';
        counter.style.cssText = `
            background: #ff6b35;
            color: white;
            border-radius: 50%;
            padding: 2px 8px;
            font-size: 0.8rem;
            margin-left: 5px;
            display: inline-block;
            min-width: 20px;
            text-align: center;
        `;
        
        let cartLink = document.querySelector('.cart-link');
        if (!cartLink) {
            const navLinks = document.querySelector('.nav-links');
            if (navLinks) {
                const li = document.createElement('li');
                cartLink = document.createElement('a');
                cartLink.href = '#';
                cartLink.className = 'cart-link';
                cartLink.innerHTML = '🛒 ';
                cartLink.onclick = (e) => {
                    e.preventDefault();
                    showCart();
                };
                li.appendChild(cartLink);
                navLinks.appendChild(li);
            }
        }
        
        if (cartLink) cartLink.appendChild(counter);
    }
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    counter.textContent = totalItems;
    counter.style.display = totalItems > 0 ? 'inline-block' : 'none';
}

async function addToCart(productId) {
    try {
        console.log(`🛒 Intentando agregar producto: ${productId}`);
        
        // Si no hay Firebase, usar datos locales
        if (!window.db) {
            showNotification('Modo offline - usando datos locales', 'info');
            
            // Buscar en productos locales
            const localProducts = [
                { id: '1', name: 'Pala Bullpadel Vertex 03', price: 89990 },
                { id: '2', name: 'Pala Head Alpha Pro', price: 75990 },
                { id: '3', name: 'Pelotas Head Padel Pro', price: 12990 },
                { id: '4', name: 'Mochila Bullpadel Advance', price: 34990 },
                { id: '5', name: 'Zapatos Asics Gel-Padel Pro', price: 55990 },
                { id: '6', name: 'Overgrips Tecnifibre', price: 8990 }
            ];
            
            const product = localProducts.find(p => p.id === productId) || {
                name: 'Producto',
                price: 0
            };
            
            const existingIndex = cart.findIndex(item => item.id === productId);
            
            if (existingIndex >= 0) {
                cart[existingIndex].quantity += 1;
            } else {
                cart.push({
                    id: productId,
                    name: product.name,
                    price: product.price,
                    quantity: 1
                });
            }
            
        } else {
            // Usar Firebase
            const doc = await window.db.collection('products').doc(productId).get();
            if (!doc.exists) {
                showNotification('Producto no encontrado', 'error');
                return;
            }
            
            const product = doc.data();
            const stock = Number(product.stock) || 0;
            
            if (stock <= 0) {
                showNotification('Producto sin stock', 'error');
                return;
            }
            
            const existingIndex = cart.findIndex(item => item.id === productId);
            
            if (existingIndex >= 0) {
                cart[existingIndex].quantity += 1;
            } else {
                cart.push({
                    id: productId,
                    name: product.name || 'Producto',
                    price: Number(product.price) || 0,
                    quantity: 1
                });
            }
        }
        
        updateCartCounter();
        showNotification('Producto agregado al carrito');
        
        // Guardar en localStorage
        localStorage.setItem('padelCart', JSON.stringify(cart));
        
    } catch (error) {
        console.error('Error agregando al carrito:', error);
        showNotification('Error al agregar producto', 'error');
    }
}

function showCart() {
    if (cart.length === 0) {
        showNotification('Tu carrito está vacío', 'info');
        return;
    }
    
    let message = '🛒 Tu Carrito:\n\n';
    let total = 0;
    
    cart.forEach((item, index) => {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        message += `${index + 1}. ${item.name}\n`;
        message += `   $${item.price.toLocaleString()} x ${item.quantity}\n`;
        message += `   Subtotal: $${subtotal.toLocaleString()}\n\n`;
    });
    
    message += `💰 TOTAL: $${total.toLocaleString()}\n\n`;
    message += '¿Deseas proceder con la compra?';
    
    if (confirm(message)) {
        showNotification('Redirigiendo a checkout...', 'info');
    }
}

// Configuración de eventos
function setupEventListeners() {
    console.log('🔧 Configurando event listeners...');
    
    // Formulario de contacto
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = contactForm.querySelector('input[type="text"]').value.trim();
            const email = contactForm.querySelector('input[type="email"]').value.trim();
            const message = contactForm.querySelector('textarea').value.trim();
            
            if (!name || !email || !message) {
                showNotification('Completa todos los campos', 'error');
                return;
            }
            
            showNotification('Enviando mensaje...', 'info');
            
            try {
                if (window.db) {
                    await window.db.collection('contacts').add({
                        name,
                        email,
                        message,
                        date: new Date(),
                        read: false
                    });
                } else {
                    console.log('📧 Mensaje (modo offline):', { name, email, message });
                }
                
                showNotification('¡Mensaje enviado! Te contactaremos pronto.');
                contactForm.reset();
                
            } catch (error) {
                console.error('Error enviando mensaje:', error);
                showNotification('Error enviando mensaje', 'error');
            }
        });
    }
    
    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href && href !== '#' && href.startsWith('#')) {
                e.preventDefault();
                
                try {
                    const targetElement = document.querySelector(href);
                    if (targetElement) {
                        window.scrollTo({
                            top: targetElement.offsetTop - 80,
                            behavior: 'smooth'
                        });
                    }
                } catch (error) {
                    console.log('Error en scroll:', error);
                }
            }
        });
    });
    
    // Botón "Ver Productos"
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', () => {
            const productsSection = document.getElementById('productos');
            if (productsSection) {
                window.scrollTo({
                    top: productsSection.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    }
    
    console.log('✅ Event listeners configurados');
}

// Función para verificar imágenes
function checkImages() {
    console.log('🔍 Verificando imágenes...');
    
    setTimeout(() => {
        const allImages = document.querySelectorAll('img');
        allImages.forEach(img => {
            if (!img.complete || img.naturalHeight === 0) {
                console.warn('⚠️ Imagen no cargada:', img.src);
                
                // Si es una imagen de producto y no cargó
                if (img.closest('.product-card')) {
                    const productName = img.alt || 'Producto';
                    handleImageError(img, productName);
                }
            } else {
                console.log('✅ Imagen cargada correctamente:', img.src);
            }
        });
    }, 2000);
}

// Función principal de inicialización
async function initializeApp() {
    console.log('🚀 Inicializando Pádel Fuego...');
    
    try {
        // Cargar carrito desde localStorage
        const savedCart = localStorage.getItem('padelCart');
        if (savedCart) {
            try {
                cart = JSON.parse(savedCart);
                console.log(`🛒 Carrito cargado: ${cart.length} productos`);
            } catch (e) {
                console.warn('Error cargando carrito:', e);
                cart = [];
            }
        }
        
        // Configurar eventos PRIMERO
        setupEventListeners();
        
        // Cargar productos DESPUÉS
        await loadProducts();
        
        // Actualizar carrito
        updateCartCounter();
        
        // Verificar imágenes
        checkImages();
        
        console.log('✅ Aplicación inicializada');
        showNotification('¡Bienvenido a Pádel Fuego!', 'success');
        
    } catch (error) {
        console.error('❌ Error inicializando:', error);
        showNotification('Error al cargar la aplicación', 'error');
    }
}

// ============================================
// 2. INICIALIZACIÓN Y EVENTOS
// ============================================

// Interceptor de errores de imágenes
window.addEventListener('error', function(e) {
    if (e.target && e.target.tagName === 'IMG') {
        console.log('⚠️ Error cargando imagen:', e.target.src);
        
        // Solo manejar si no es ya la imagen por defecto
        if (!e.target.src.includes('/images/default-product.jpg')) {
            // Si es una imagen de producto
            if (e.target.closest('.product-card')) {
                const productName = e.target.alt || 'Producto';
                handleImageError(e.target, productName);
            } else {
                // Para otras imágenes
                e.target.src = '/images/default-product.jpg';
                e.target.onerror = null;
            }
        }
        
        e.preventDefault();
        return false;
    }
}, true);

// Pre-cargar imágenes importantes
window.addEventListener('load', function() {
    // Pre-cargar imagen por defecto
    const preloadImg = new Image();
    preloadImg.src = '/images/default-product.jpg';
    console.log('🖼️ Pre-cargando imagen por defecto');
});

// Cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM cargado');
    
    // Esperar un momento para que todo cargue
    setTimeout(() => {
        initializeApp();
    }, 500);
});

// ============================================
// 3. HACER FUNCIONES DISPONIBLES GLOBALMENTE
// ============================================
window.addToCart = addToCart;
window.showCart = showCart;
window.loadProducts = loadProducts;
window.showNotification = showNotification;
window.updateCartCounter = updateCartCounter;
window.setupEventListeners = setupEventListeners;
window.handleImageError = handleImageError;