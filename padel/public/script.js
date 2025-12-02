// ============================================
// PÁDEL FUEGO - SCRIPT PRINCIPAL COMPLETO
// VERSIÓN CORREGIDA - CON CARRITO MEJORADO
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
    
    // Usar placeholder de Internet en lugar de imagen local
    imgElement.src = 'https://via.placeholder.com/300x200/2c5530/FFFFFF?text=' + encodeURIComponent(productName.substring(0, 20));
    imgElement.alt = productName;
    imgElement.onerror = null; // Prevenir loops
    
    // Si la imagen por defecto también falla
    imgElement.onerror = function() {
        this.style.display = 'none';
        this.parentElement.innerHTML = '<div style="width:100%;height:200px;background:#2c5530;color:white;display:flex;align-items:center;justify-content:center;">' + productName.substring(0, 30) + '</div>';
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
    if (num > 10) return `✓ En stock (${num})`;
    if (num > 0) return `⚠️ Solo ${num} unidades`;
    return '✗ Sin stock';
}

// Función para mostrar productos - CORREGIDA PARA IMÁGENES
function displayProduct(product) {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;
    
    // CORRECCIÓN CRÍTICA: Obtener la imagen correcta de Firestore
    // Firestore usa 'image', pero también verificamos 'imageUrl' por compatibilidad
    const imageFromFirestore = product.image || product.imageUrl;
    
    const safeProduct = {
        id: product.id || 'unknown',
        name: product.name || 'Producto sin nombre',
        brand: product.brand || 'Marca no especificada',
        description: product.description || 'Sin descripción',
        price: Number(product.price) || 0,
        stock: Number(product.stock) || 0,
        rating: Number(product.rating) || 0,
        // USAR LA IMAGEN DE FIRESTORE, NO LA POR DEFECTO
        imageUrl: imageFromFirestore || 'https://via.placeholder.com/300x200/2c5530/FFFFFF?text=' + encodeURIComponent((product.name || 'Producto').substring(0, 20))
    };
    
    console.log(`🖼️ Mostrando producto: ${safeProduct.name}`);
    console.log(`   URL de imagen: ${safeProduct.imageUrl}`);
    
    const productCard = document.createElement('div');
    productCard.className = 'product-card';
    productCard.innerHTML = `
        <div class="product-image" style="cursor: pointer;" onclick="viewProductDetails('${safeProduct.id}')">
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
    <button class="add-to-cart" onclick="addToCart('${safeProduct.id}', '${safeProduct.name.replace(/'/g, "\\'")}', ${safeProduct.price}, ${safeProduct.stock})" 
            ${safeProduct.stock === 0 ? 'disabled' : ''}>
        ${safeProduct.stock === 0 ? 'Sin stock' : 'Agregar al Carrito'}
    </button><button class="view-details" onclick="viewProductDetails('${safeProduct.id}')" style="background: #4a7c59; margin-top: 10px;">
    👁️ Ver Detalles
</button>
`;
    
    productsGrid.appendChild(productCard);
}
// Función para ver detalles del producto
function viewProductDetails(productId) {
    window.location.href = `product-details.html?id=${productId}`;
}

// Hacer disponible globalmente
window.viewProductDetails = viewProductDetails;


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
            image: 'https://http2.mlstatic.com/D_NQ_NP_2X_898905-MLA53507129989_012022-F.webp'
        },
        {
            id: '2',
            name: 'Pala Head Alpha Pro',
            description: 'Control máximo para jugadores avanzados',
            price: 75990,
            brand: 'Head',
            stock: 8,
            rating: 4.3,
            image: 'https://http2.mlstatic.com/D_NQ_NP_2X_653317-MLA47970639143_102021-F.webp'
        },
        {
            id: '3',
            name: 'Pelotas Head Padel Pro',
            description: 'Tubo de 3 pelotas profesionales',
            price: 12990,
            brand: 'Head',
            stock: 50,
            rating: 4.7,
            image: 'https://http2.mlstatic.com/D_NQ_NP_2X_708131-MLA48373161791_112021-F.webp'
        },
        {
            id: '4',
            name: 'Mochila Bullpadel Advance',
            description: 'Mochila con compartimento térmico para 2 palas',
            price: 34990,
            brand: 'Bullpadel',
            stock: 12,
            rating: 4.2,
            image: 'https://http2.mlstatic.com/D_NQ_NP_2X_886056-MLU72877094720_112023-F.webp'
        },
        {
            id: '5',
            name: 'Zapatos Asics Gel-Padel Pro',
            description: 'Calzado profesional con tecnología GEL',
            price: 55990,
            brand: 'Asics',
            stock: 6,
            rating: 4.6,
            image: 'https://http2.mlstatic.com/D_NQ_NP_2X_985856-MLA53777607358_022023-F.webp'
        },
        {
            id: '6',
            name: 'Overgrips Tecnifibre',
            description: 'Pack de 10 overgrips absorbentes',
            price: 8990,
            brand: 'Tecnifibre',
            stock: 45,
            rating: 4.4,
            image: 'https://http2.mlstatic.com/D_NQ_NP_2X_724145-MLU74929228632_032024-F.webp'
        }
    ];
    
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;
    
    productsGrid.innerHTML = '';
    localProducts.forEach(product => displayProduct(product));
    
    showNotification('Mostrando productos de demostración', 'info');
}

// Función principal para cargar productos - CORREGIDA
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
            
            querySnapshot.forEach(doc => {
                const productData = doc.data();
                
                // DEBUG: Ver qué datos vienen de Firestore
                console.log(`🎯 Producto ${activeProducts + 1}: ${productData.name}`);
                console.log(`   Campos disponibles:`, Object.keys(productData));
                console.log(`   Imagen (campo 'image'):`, productData.image);
                console.log(`   Imagen (campo 'imageUrl'):`, productData.imageUrl);
                
                // Crear producto con ID y datos
                const product = {
                    id: doc.id,
                    ...productData
                };
                
                displayProduct(product);
                activeProducts++;
            });
            
            if (activeProducts === 0) {
                console.log('📦 No hay productos activos');
                loadLocalProducts();
            } else {
                console.log(`✅ ${activeProducts} productos cargados desde Firestore`);
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
    
    // Calcular totales
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

// Función para agregar al carrito (MEJORADA)
async function addToCart(productId, productName, productPrice, productStock) {
    try {
        console.log(`🛒 Agregando producto: ${productId} - ${productName}`);
        
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
                price: productPrice,
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
        
        // 2. Configurar eventos
        setupEventListeners();
        
        // 3. Cargar productos
        await loadProducts();
        
        // 4. Actualizar carrito
        renderCart();
        
        // 5. Iniciar monitoreo de stock en tiempo real
        watchStockChanges();
        
        // 6. Verificar imágenes
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
        
        // Solo manejar si es una imagen de producto
        if (e.target.closest('.product-card')) {
            const productName = e.target.alt || 'Producto';
            handleImageError(e.target, productName);
        }
        
        e.preventDefault();
        return false;
    }
}, true);

// Cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM cargado - Pádel Fuego');
    console.log('🌐 Sitio: https://padelfuego.web.app');
    
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
window.handleImageError = handleImageError;
window.renderCart = renderCart;
window.updateProductStockUI = updateProductStockUI;
window.watchStockChanges = watchStockChanges;