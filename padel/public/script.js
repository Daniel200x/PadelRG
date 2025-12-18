// ============================================
// PÁDEL FUEGO - SCRIPT PRINCIPAL COMPLETO
// VERSIÓN 2.0 - SIN IMÁGENES POR DEFECTO
// ============================================

// 1. DECLARAR TODAS LAS FUNCIONES PRIMERO
// ============================================

// Función para manejar imágenes - SOLO usa imagen de Firebase o nada
function loadProductImage(imgElement, product) {
    // 1. Intentar con la imagen del producto de Firebase
    const firebaseImage = product.image || product.imageUrl;
    
    if (firebaseImage) {
        console.log(`🖼️ Intentando cargar imagen de Firebase: ${firebaseImage}`);
        
        const preloadImage = new Image();
        
        preloadImage.onload = function() {
            // La imagen se cargó correctamente
            imgElement.src = firebaseImage;
            imgElement.style.opacity = '1';
            console.log(`✅ Imagen cargada desde Firebase: ${product.name}`);
        };
        
        preloadImage.onerror = function() {
            // Si falla la imagen de Firebase, NO cargar nada
            console.log(`❌ Imagen de Firebase no disponible: ${firebaseImage}`);
            handleNoImage(imgElement, product);
        };
        
        // Iniciar carga
        preloadImage.src = firebaseImage;
        
        // Mientras carga, mostrar transición suave
        imgElement.style.opacity = '0.3';
        imgElement.style.transition = 'opacity 0.3s ease';
    } else {
        // No hay imagen en Firebase
        console.log(`📭 Producto sin imagen en Firebase: ${product.name}`);
        handleNoImage(imgElement, product);
    }
}

// Función para manejar cuando NO hay imagen
function handleNoImage(imgElement, product) {
    // Ocultar la etiqueta img
    imgElement.style.display = 'none';
    
    // Crear un contenedor de "sin imagen"
    const noImageContainer = document.createElement('div');
    noImageContainer.className = 'no-image-container';
    noImageContainer.style.cssText = `
        width: 100%;
        height: 200px;
        background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: #6c757d;
        text-align: center;
        padding: 20px;
    `;
    
    noImageContainer.innerHTML = `
        <div style="font-size: 2.5rem; margin-bottom: 10px;">🏸</div>
        <div style="font-weight: 600; font-size: 0.9rem; margin-bottom: 5px;">${product.name.substring(0, 30)}</div>
        <div style="font-size: 0.8rem; opacity: 0.7;">Imagen no disponible</div>
    `;
    
    // Insertar después de la imagen
    imgElement.parentNode.appendChild(noImageContainer);
}

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
    if (num > 10) return `✓ En stock (${num})`;
    if (num > 0) return `⚠️ Solo ${num} unidades`;
    return '✗ Sin stock';
}

// Función para mostrar productos - CON DESCUENTO VISUAL
function displayProduct(product) {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;
    
    // Datos seguros del producto
    const safeProduct = {
        id: product.id || 'unknown',
        name: product.name || 'Producto sin nombre',
        brand: product.brand || 'Marca no especificada',
        description: product.description || 'Sin descripción',
        price: Number(product.price) || 0,
        stock: Number(product.stock) || 0,
        rating: Number(product.rating) || 0,
        image: product.image || product.imageUrl || null // Solo imagen de Firebase
    };
    
    // Calcular precio con descuento (solo para mostrar visualmente)
    const discountRate = 0.10; // 10%
    const discountPrice = safeProduct.price * (1 - discountRate);
    
    const productCard = document.createElement('div');
    productCard.className = 'product-card';
    productCard.innerHTML = `
        <div class="product-image" style="cursor: pointer; position: relative; min-height: 200px;" onclick="viewProductDetails('${safeProduct.id}')">
            <img src="" 
                 alt="${safeProduct.name}"
                 loading="lazy"
                 class="product-img"
                 data-product-id="${safeProduct.id}"
                 data-has-image="${!!safeProduct.image}"
                 style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px;">
        </div>
        <h3>${safeProduct.name}</h3>
        <p class="brand">${safeProduct.brand}</p>
        <p class="description">${safeProduct.description.substring(0, 80)}${safeProduct.description.length > 80 ? '...' : ''}</p>
        
        <!-- Precios con descuento (solo visual) -->
        <div class="price-container">
            <div class="original-price">
                Antes: $${safeProduct.price.toLocaleString('es-AR')}
            </div>
            <div class="discount-price">
                Ahora: $${discountPrice.toLocaleString('es-AR', {minimumFractionDigits: 0, maximumFractionDigits: 0})}
            </div>
            <div class="discount-badge">
                🔥 10% OFF
            </div>
            <div class="payment-method">
                <small>Aplica en efectivo/transferencia</small>
            </div>
        </div>
        
        <div class="stock ${safeProduct.stock > 10 ? 'in-stock' : safeProduct.stock > 0 ? 'low-stock' : 'no-stock'}">
            ${getStockMessage(safeProduct.stock)}
        </div>
        <div class="rating">${getRatingStars(safeProduct.rating)} ${formatRating(safeProduct.rating)}/5</div>
        
        <!-- IMPORTANTE: Enviar precio ORIGINAL al carrito -->
        <button class="add-to-cart" onclick="addToCart('${safeProduct.id}', '${safeProduct.name.replace(/'/g, "\\'")}', ${safeProduct.price}, ${safeProduct.stock})" 
                ${safeProduct.stock === 0 ? 'disabled' : ''}>
            ${safeProduct.stock === 0 ? 'Sin stock' : 'Agregar al Carrito'}
        </button>
        
        <button class="view-details" onclick="viewProductDetails('${safeProduct.id}')">
            Ver Detalles
        </button>
    `;
    
    productsGrid.appendChild(productCard);
    
    // Cargar la imagen SOLO si existe en Firebase
    setTimeout(() => {
        const imgElement = productCard.querySelector('.product-img');
        if (imgElement) {
            if (safeProduct.image) {
                loadProductImage(imgElement, safeProduct);
            } else {
                // No hay imagen en Firebase
                handleNoImage(imgElement, safeProduct);
            }
        }
    }, 100);
}

// Función para ver detalles del producto
function viewProductDetails(productId) {
    window.location.href = `product-details.html?id=${productId}`;
}

// Hacer disponible globalmente
window.viewProductDetails = viewProductDetails;

// Función para cargar productos locales (fallback) - CON DESCUENTO VISUAL
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
            image: null // Sin imagen por defecto
        },
        {
            id: '2',
            name: 'Pala Head Alpha Pro',
            description: 'Control máximo para jugadores avanzados',
            price: 75990,
            brand: 'Head',
            stock: 8,
            rating: 4.3,
            image: null
        },
        {
            id: '3',
            name: 'Pelotas Head Padel Pro',
            description: 'Tubo de 3 pelotas profesionales',
            price: 12990,
            brand: 'Head',
            stock: 50,
            rating: 4.7,
            image: null
        },
        {
            id: '4',
            name: 'Mochila Bullpadel Advance',
            description: 'Mochila con compartimento térmico para 2 palas',
            price: 34990,
            brand: 'Bullpadel',
            stock: 12,
            rating: 4.2,
            image: null
        },
        {
            id: '5',
            name: 'Zapatos Asics Gel-Padel Pro',
            description: 'Calzado profesional con tecnología GEL',
            price: 55990,
            brand: 'Asics',
            stock: 6,
            rating: 4.6,
            image: null
        },
        {
            id: '6',
            name: 'Overgrips Tecnifibre',
            description: 'Pack de 10 overgrips absorbentes',
            price: 8990,
            brand: 'Tecnifibre',
            stock: 45,
            rating: 4.4,
            image: null
        }
    ];
    
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;
    
    productsGrid.innerHTML = '';
    localProducts.forEach(product => displayProduct(product));
    
    showNotification('Mostrando productos de demostración (sin imágenes)', 'info');
}

// Función principal para cargar productos
async function loadProducts() {
    console.log('🔄 Cargando productos desde Firestore...');
    
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
        
        console.log('🔍 Conectando a Firestore...');
        
        try {
            const querySnapshot = await window.db.collection('products').get();
            
            console.log(`📊 Productos encontrados en Firestore: ${querySnapshot.size}`);
            
            if (querySnapshot.empty) {
                console.log('📦 No hay productos en Firestore');
                loadLocalProducts();
                return;
            }
            
            productsGrid.innerHTML = '';
            let activeProducts = 0;
            let productsWithImages = 0;
            
            querySnapshot.forEach(doc => {
                const productData = doc.data();
                
                // DEBUG: Ver qué datos vienen de Firestore
                console.log(`🎯 Producto ${activeProducts + 1}: ${productData.name || 'Sin nombre'}`);
                console.log(`   Imagen en Firebase: ${productData.image || productData.imageUrl || 'NO TIENE'}`);
                
                // Crear producto con ID y datos
                const product = {
                    id: doc.id,
                    ...productData
                };
                
                displayProduct(product);
                activeProducts++;
                
                if (productData.image || productData.imageUrl) {
                    productsWithImages++;
                }
            });
            
            if (activeProducts === 0) {
                console.log('📦 No hay productos activos');
                loadLocalProducts();
            } else {
                console.log(`✅ ${activeProducts} productos cargados desde Firestore`);
                console.log(`🖼️ ${productsWithImages} productos con imágenes`);
                showNotification(`${activeProducts} productos cargados`, 'success');
            }
            
        } catch (firestoreError) {
            console.error('❌ Error de Firestore:', firestoreError);
            showNotification('Error conectando a la base de datos', 'error');
            loadLocalProducts();
        }
        
    } catch (error) {
        console.error('❌ Error general cargando productos:', error);
        showNotification('Error cargando productos', 'error');
        loadLocalProducts();
    }
}

// ============================================
// CARRITO DE COMPRAS MEJORADO
// ============================================

let cart = [];
let cartOpen = false;

// Función para inicializar el carrito
function initCart() {
    console.log('🛒 Inicializando carrito...');
    
    // Cargar carrito desde localStorage
    const savedCart = localStorage.getItem('padelCart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
            console.log(`Carrito cargado: ${cart.length} productos`);
        } catch (e) {
            console.warn('Error cargando carrito:', e);
            cart = [];
        }
    }
    
    // Crear modal del carrito
    createCartModal();
    
    // Agregar botón del carrito al navbar
    addCartButtonToNav();
    
    // Actualizar contador
    updateCartCounter();
}

// Crear modal del carrito
function createCartModal() {
    // Si ya existe, no crear de nuevo
    if (document.getElementById('cart-modal')) return;
    
    const modalHTML = `
        <div id="cart-modal" class="cart-modal" style="display: none;">
            <div class="cart-modal-content">
                <div class="cart-header">
                    <h3>🛒 Tu Carrito</h3>
                    <button class="close-cart" onclick="toggleCart()">×</button>
                </div>
                
                <div class="cart-body">
                    <div id="cart-items" class="cart-items">
                        <!-- Productos se cargan aquí -->
                    </div>
                </div>
                
                <div class="cart-footer">
                    <div class="cart-summary">
                        <div class="cart-total">
                            <span>Total:</span>
                            <span id="cart-total">$0</span>
                        </div>
                    </div>
                    
                    <div class="cart-actions">
                        <button class="btn-clear" onclick="clearCart()">
                            🗑️ Vaciar Carrito
                        </button>
                        <button class="btn-checkout" onclick="checkout()">
                            💳 Finalizar Compra
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Agregar botón del carrito al navbar
function addCartButtonToNav() {
    const navLinks = document.querySelector('.nav-links');
    if (!navLinks) return;
    
    // Verificar si ya existe
    if (document.querySelector('.cart-link')) return;
    
    const cartLinkHTML = `
        <li>
            <a href="#" class="cart-link" onclick="toggleCart(); return false;">
                🛒 Carrito <span id="cart-counter" class="cart-counter" style="display: none;">0</span>
            </a>
        </li>
    `;
    
    navLinks.insertAdjacentHTML('beforeend', cartLinkHTML);
}

// Función para alternar carrito
function toggleCart() {
    const modal = document.getElementById('cart-modal');
    if (!modal) return;
    
    cartOpen = !cartOpen;
    if (cartOpen) {
        modal.style.display = 'flex';
        renderCart();
    } else {
        modal.style.display = 'none';
    }
}

// Función para renderizar el carrito
function renderCart() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const cartCounter = document.getElementById('cart-counter');
    
    if (!cartItems || !cartTotal) return;
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="empty-cart">Tu carrito está vacío</div>';
        cartTotal.textContent = '$0';
        if (cartCounter) {
            cartCounter.textContent = '0';
            cartCounter.style.display = 'none';
        }
        return;
    }
    
    // Calcular totales con precio ORIGINAL
    let total = 0;
    let totalItems = 0;
    
    // Renderizar items
    cartItems.innerHTML = '';
    cart.forEach((item, index) => {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        totalItems += item.quantity;
        
        const itemHTML = `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p class="cart-item-price">$${item.price.toLocaleString('es-AR')} c/u</p>
                    ${item.maxStock !== undefined ? `<p style="color: #666; font-size: 0.8rem;">Stock disponible: ${item.maxStock}</p>` : ''}
                </div>
                <div class="cart-item-controls">
                    <button onclick="updateQuantity(${index}, -1)" ${item.quantity <= 1 ? 'disabled style="opacity: 0.5;"' : ''}>−</button>
                    <span class="cart-item-quantity">${item.quantity}</span>
                    <button onclick="updateQuantity(${index}, 1)" ${item.maxStock !== undefined && item.quantity >= item.maxStock ? 'disabled style="opacity: 0.5;"' : ''}>+</button>
                    <button class="remove-btn" onclick="removeFromCart(${index})">🗑️</button>
                </div>
                <div class="cart-item-subtotal">
                    Subtotal: $${subtotal.toLocaleString('es-AR')}
                </div>
            </div>
        `;
        cartItems.insertAdjacentHTML('beforeend', itemHTML);
    });
    
    cartTotal.textContent = `$${total.toLocaleString('es-AR')}`;
    
    // Actualizar contador
    if (cartCounter) {
        cartCounter.textContent = totalItems.toString();
        cartCounter.style.display = totalItems > 0 ? 'inline-block' : 'none';
    }
    
    // Guardar en localStorage
    localStorage.setItem('padelCart', JSON.stringify(cart));
}

// Función para actualizar cantidad
function updateQuantity(index, change) {
    if (!cart[index]) return;
    
    const newQuantity = cart[index].quantity + change;
    
    if (newQuantity < 1) {
        removeFromCart(index);
    } else {
        // Verificar si hay límite de stock
        if (cart[index].maxStock !== undefined && newQuantity > cart[index].maxStock) {
            showNotification(`Máximo disponible: ${cart[index].maxStock} unidades`, 'warning');
            return;
        }
        
        cart[index].quantity = newQuantity;
        renderCart();
        showNotification(`Cantidad actualizada: ${cart[index].name} (${newQuantity})`, 'info');
    }
}

// Función para eliminar del carrito
function removeFromCart(index) {
    if (!cart[index]) return;
    
    const productName = cart[index].name;
    cart.splice(index, 1);
    renderCart();
    showNotification(`${productName} eliminado del carrito`, 'info');
}

// Función para vaciar carrito
function clearCart() {
    if (cart.length === 0) {
        showNotification('El carrito ya está vacío', 'info');
        return;
    }
    
    if (confirm('¿Estás seguro de vaciar todo el carrito?')) {
        cart = [];
        renderCart();
        showNotification('Carrito vaciado', 'info');
    }
}

// Función para checkout
function checkout() {
    if (cart.length === 0) {
        showNotification('Tu carrito está vacío', 'warning');
        return;
    }
    
    // Verificar stock antes de proceder al checkout
    checkCartStockBeforeCheckout();
}

// Verificar stock antes del checkout
async function checkCartStockBeforeCheckout() {
    try {
        if (!window.db) {
            // Si no hay Firebase, proceder directamente
            proceedToCheckout();
            return;
        }
        
        showNotification('Verificando disponibilidad de stock...', 'info');
        
        const stockIssues = [];
        
        for (const item of cart) {
            try {
                const productRef = window.db.collection('products').doc(item.id);
                const productDoc = await productRef.get();
                
                if (productDoc.exists) {
                    const productData = productDoc.data();
                    const currentStock = Number(productData.stock) || 0;
                    
                    if (currentStock < item.quantity) {
                        stockIssues.push({
                            item: item,
                            availableStock: currentStock,
                            needed: item.quantity - currentStock
                        });
                    }
                } else {
                    stockIssues.push({
                        item: item,
                        availableStock: 0,
                        error: 'Producto no encontrado'
                    });
                }
            } catch (error) {
                console.error(`Error verificando stock de ${item.name}:`, error);
            }
        }
        
        if (stockIssues.length > 0) {
            let message = 'Algunos productos tienen stock insuficiente:\n\n';
            stockIssues.forEach(issue => {
                message += `• ${issue.item.name}: Pedido ${issue.item.quantity}, Disponible ${issue.availableStock}\n`;
            });
            message += '\nPor favor, ajusta las cantidades en tu carrito.';
            
            if (confirm(message + '\n\n¿Deseas proceder al checkout igualmente?')) {
                proceedToCheckout();
            }
        } else {
            proceedToCheckout();
        }
        
    } catch (error) {
        console.error('Error verificando stock:', error);
        showNotification('Error verificando disponibilidad', 'error');
        proceedToCheckout(); // Proceder de todos modos
    }
}

// Proceder al checkout
function proceedToCheckout() {
    // Guardar carrito actual
    localStorage.setItem('padelCart', JSON.stringify(cart));
    
    // Redirigir a checkout.html
    window.location.href = 'checkout.html';
}

// Función para agregar al carrito
async function addToCart(productId, productName, productPrice, productStock) {
    try {
        console.log(`🛒 Agregando producto: ${productId} - ${productName}`);
        
        // Siempre usar precio ORIGINAL (el descuento se aplica en checkout)
        const finalPrice = productPrice;
        
        // Verificar stock en tiempo real si hay conexión a Firebase
        let currentStock = productStock;
        let stockCheckPassed = true;
        
        if (window.db) {
            try {
                const productRef = window.db.collection('products').doc(productId);
                const productDoc = await productRef.get();
                
                if (productDoc.exists) {
                    const productData = productDoc.data();
                    currentStock = Number(productData.stock) || 0;
                    
                    if (currentStock <= 0) {
                        showNotification(`${productName} está agotado`, 'error');
                        // Actualizar UI
                        updateProductStockUI(productId, 0);
                        return;
                    }
                }
            } catch (error) {
                console.error('Error verificando stock en tiempo real:', error);
            }
        }
        
        // Verificar si el producto ya está en el carrito
        const existingIndex = cart.findIndex(item => item.id === productId);
        
        if (existingIndex >= 0) {
            // Verificar si hay suficiente stock para agregar más
            const requestedQuantity = cart[existingIndex].quantity + 1;
            
            if (currentStock !== undefined && requestedQuantity > currentStock) {
                showNotification(`Solo quedan ${currentStock} unidades de ${productName}`, 'warning');
                // Actualizar el límite en el carrito
                cart[existingIndex].maxStock = currentStock;
                renderCart();
                return;
            }
            
            // Si ya existe, aumentar cantidad
            cart[existingIndex].quantity += 1;
            cart[existingIndex].maxStock = currentStock;
            showNotification(`+1 ${productName} (total: ${cart[existingIndex].quantity})`, 'info');
        } else {
            // Si no existe, agregar nuevo
            cart.push({
                id: productId,
                name: productName,
                price: finalPrice, // Precio ORIGINAL
                quantity: 1,
                maxStock: currentStock
            });
            showNotification(`${productName} agregado al carrito`, 'success');
        }
        
        // Actualizar carrito
        renderCart();
        
    } catch (error) {
        console.error('Error agregando al carrito:', error);
        showNotification('Error al agregar producto al carrito', 'error');
    }
}

// Función para actualizar contador
function updateCartCounter() {
    const counter = document.getElementById('cart-counter');
    if (!counter) return;
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    counter.textContent = totalItems.toString();
    counter.style.display = totalItems > 0 ? 'inline-block' : 'none';
}

// ============================================
// FUNCIONES PARA EL BANNER PROMOCIONAL
// ============================================

// Función para cerrar el banner
function closePromoBanner() {
    const promoBanner = document.getElementById('promo-banner');
    if (!promoBanner) return;
    
    // Ocultar inmediatamente
    promoBanner.style.display = 'none';
    document.body.classList.remove('has-promo-banner');
}

// Función para inicializar el banner
function initPromoBanner() {
    const promoBanner = document.getElementById('promo-banner');
    if (!promoBanner) return;
    
    // Mostrar el banner
    promoBanner.style.display = 'flex';
    document.body.classList.add('has-promo-banner');
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
    
    // Cerrar carrito al hacer clic fuera
    document.addEventListener('click', (e) => {
        const modal = document.getElementById('cart-modal');
        if (modal && cartOpen && !modal.contains(e.target) && 
            !e.target.closest('.cart-link')) {
            toggleCart();
        }
    });
    
    // Cerrar carrito con ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && cartOpen) {
            toggleCart();
        }
    });
    
    // Cerrar banner con ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const promoBanner = document.getElementById('promo-banner');
            if (promoBanner && promoBanner.style.display !== 'none') {
                closePromoBanner();
            }
        }
    });
    
    // Eventos para WhatsApp
    const whatsappContainer = document.getElementById('whatsapp-container');
    const whatsappBtn = document.getElementById('whatsapp-main-btn');
    
    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            whatsappContainer.classList.toggle('active');
        });
    }
    
    // Cerrar WhatsApp al hacer clic fuera
    document.addEventListener('click', function(event) {
        if (whatsappContainer && !whatsappContainer.contains(event.target)) {
            whatsappContainer.classList.remove('active');
        }
    });
    
    // Cerrar WhatsApp con ESC
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && whatsappContainer) {
            whatsappContainer.classList.remove('active');
        }
    });
    
    console.log('✅ Event listeners configurados');
}

// Verificación de imágenes
function checkImagesStatus() {
    setTimeout(() => {
        console.log('🔍 Verificando estado de imágenes...');
        
        const allImages = document.querySelectorAll('.product-img[data-has-image="true"]');
        let loaded = 0;
        let failed = 0;
        
        allImages.forEach(img => {
            if (img.complete && img.naturalHeight !== 0) {
                loaded++;
            } else {
                failed++;
            }
        });
        
        const noImageContainers = document.querySelectorAll('.no-image-container');
        console.log(`📊 Imágenes: ${loaded} cargadas, ${failed} fallidas`);
        console.log(`📭 Productos sin imagen: ${noImageContainers.length}`);
    }, 3000);
}

// ============================================
// FUNCIONES DE MONITOREO DE STOCK EN TIEMPO REAL
// ============================================

// Actualizar UI de stock de producto
function updateProductStockUI(productId, newStock) {
    // Buscar el producto en la UI y actualizar el stock
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        const button = card.querySelector('.add-to-cart');
        if (button && button.getAttribute('onclick')?.includes(productId)) {
            const stockElement = card.querySelector('.stock');
            if (stockElement) {
                stockElement.textContent = getStockMessage(newStock);
                stockElement.className = 'stock ' + 
                    (newStock > 10 ? 'in-stock' : 
                     newStock > 0 ? 'low-stock' : 'no-stock');
                
                // Deshabilitar botón si no hay stock
                button.disabled = newStock === 0;
                
                // Actualizar la función onclick con el nuevo stock
                const onclickAttr = button.getAttribute('onclick');
                const regex = /addToCart\('([^']+)', '([^']+)', ([^,]+), ([^)]+)\)/;
                const match = onclickAttr.match(regex);
                
                if (match) {
                    const newOnclick = `addToCart('${match[1]}', '${match[2]}', ${match[3]}, ${newStock})`;
                    button.setAttribute('onclick', newOnclick);
                }
                
                button.textContent = newStock === 0 ? 'Sin stock' : 'Agregar al Carrito';
            }
        }
    });
}

// Escuchar cambios de stock en tiempo real
function watchStockChanges() {
    if (!window.db) {
        console.log('⚠️ Firebase no disponible para monitoreo de stock');
        return;
    }
    
    console.log('👀 Monitoreando cambios de stock en tiempo real...');
    
    // Escuchar cambios en productos
    window.db.collection('products').onSnapshot((snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === 'modified') {
                const product = change.doc.data();
                const productId = change.doc.id;
                
                console.log(`📊 Stock actualizado: ${product.name} - ${product.stock}`);
                
                // Actualizar UI si el producto está visible
                updateProductStockUI(productId, product.stock);
                
                // Actualizar carrito si el producto está en él
                const cartItemIndex = cart.findIndex(item => item.id === productId);
                if (cartItemIndex >= 0) {
                    cart[cartItemIndex].maxStock = product.stock;
                    
                    // Si la cantidad en el carrito supera el nuevo stock, ajustar
                    if (cart[cartItemIndex].quantity > product.stock) {
                        cart[cartItemIndex].quantity = product.stock;
                        showNotification(`Stock reducido para ${product.name}. Cantidad ajustada a ${product.stock}.`, 'warning');
                        renderCart();
                    }
                }
            }
        });
    }, (error) => {
        console.error('❌ Error en monitoreo de stock:', error);
    });
}

// ============================================
// FUNCIÓN PRINCIPAL DE INICIALIZACIÓN
// ============================================

async function initializeApp() {
    console.log('🚀 Inicializando Pádel Fuego...');
    
    try {
        // 1. Inicializar carrito PRIMERO
        initCart();
        
        // 2. Inicializar banner promocional
        initPromoBanner();
        
        // 3. Configurar eventos
        setupEventListeners();
        
        // 4. Cargar productos
        await loadProducts();
        
        // 5. Actualizar carrito
        renderCart();
        
        // 6. Iniciar monitoreo de stock en tiempo real
        watchStockChanges();
        
        // 7. Verificar estado de imágenes
        setTimeout(() => {
            checkImagesStatus();
        }, 2000);
        
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

// Manejo de errores global de imágenes
window.addEventListener('error', function(e) {
    if (e.target && e.target.tagName === 'IMG') {
        console.log('⚠️ Error cargando imagen global:', e.target.src);
        
        // Prevenir comportamiento por defecto
        e.preventDefault();
        return false;
    }
}, true);

// Cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM cargado - Pádel Fuego');
    console.log('🌐 Sitio: https://padelfuego.web.app');
    console.log('📱 Solo imágenes de Firebase (sin placeholders)');
    
    // Esperar un momento para que todo cargue
    setTimeout(() => {
        initializeApp();
    }, 500);
});

// ============================================
// 3. HACER FUNCIONES DISPONIBLES GLOBALMENTE
// ============================================
window.addToCart = addToCart;
window.toggleCart = toggleCart;
window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;
window.clearCart = clearCart;
window.checkout = checkout;
window.loadProducts = loadProducts;
window.showNotification = showNotification;
window.updateCartCounter = updateCartCounter;
window.setupEventListeners = setupEventListeners;
window.loadProductImage = loadProductImage;
window.handleNoImage = handleNoImage;
window.renderCart = renderCart;
window.updateProductStockUI = updateProductStockUI;
window.watchStockChanges = watchStockChanges;
window.viewProductDetails = viewProductDetails;

// NUEVO: Agregar funciones del banner
window.closePromoBanner = closePromoBanner;