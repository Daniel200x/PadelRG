// ============================================
// VARIABLES GLOBALES MEJORADAS
// ============================================
let currentProduct = null;
let currentImages = [];
let relatedProducts = [];
let db = null;
let hasLoaded = false;
let cart = [];
let cartOpen = false;
let currentZoomIndex = 0;

// ============================================
// FUNCIONES DE UTILIDAD
// ============================================

// Obtener ID del producto desde la URL con validación
function getProductIdFromURL() {
    try {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        
        if (!id || id.trim() === '' || id.length < 3) {
            console.error('ID de producto inválido:', id);
            return null;
        }
        
        return id.trim();
    } catch (error) {
        console.error('Error obteniendo ID de la URL:', error);
        return null;
    }
}

// Función para verificar la conexión a Firebase
async function testFirebaseConnection() {
    console.log('🔍 Verificando conexión a Firebase...');
    
    if (!window.db) {
        console.error('❌ window.db no está definido');
        return false;
    }
    
    try {
        const testQuery = await window.db.collection('products').limit(1).get();
        console.log('✅ Conexión a Firestore OK. Total productos:', testQuery.size);
        return true;
    } catch (error) {
        console.error('❌ Error de conexión a Firestore:', error);
        console.error('Detalles del error:', error.code, error.message);
        return false;
    }
}

// Función para mostrar error simple
function showError(message) {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('error-message').style.display = 'block';
    document.getElementById('error-message').textContent = message;
}

// Función mejorada para mostrar error con opciones
function showErrorWithOptions(message) {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('error-message').style.display = 'block';
    
    const errorElement = document.getElementById('error-message');
    errorElement.innerHTML = `
        <div style="text-align: center;">
            <h3 style="color: #721c24; margin-bottom: 15px;">${message}</h3>
            <p style="margin-bottom: 20px;">Puedes:</p>
            <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                <button onclick="window.location.href='/'" 
                        style="padding: 10px 20px; background: #2c5530; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    ← Volver a la Tienda
                </button>
                <button onclick="tryAlternativeProduct()" 
                        style="padding: 10px 20px; background: #4a7c59; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    Ver Productos Similares
                </button>
                <button onclick="retryLoadProduct()" 
                        style="padding: 10px 20px; background: #ff6b35; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    Reintentar
                </button>
            </div>
        </div>
    `;
}

// Función para intentar cargar un producto alternativo
function tryAlternativeProduct() {
    console.log('🔄 Buscando productos alternativos...');
    window.location.href = '/#productos';
}

// Función para reintentar carga
function retryLoadProduct() {
    console.log('🔄 Reintentando carga del producto...');
    document.getElementById('error-message').style.display = 'none';
    document.getElementById('loading').style.display = 'block';
    
    hasLoaded = false;
    loadProduct();
}

// Generar HTML de estrellas
function getStarsHTML(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    let starsHTML = '';
    
    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            starsHTML += '⭐';
        } else if (i === fullStars && halfStar) {
            starsHTML += '⭐';
        } else {
            starsHTML += '☆';
        }
    }
    
    return starsHTML;
}

// ============================================
// FUNCIONES PRINCIPALES DE CARGA
// ============================================

// Función principal para cargar producto
async function loadProduct() {
    if (hasLoaded) {
        console.log('⏭️ Ya se cargó el producto, saltando...');
        return;
    }
    
    const productId = getProductIdFromURL();
    
    if (!productId) {
        showError('ID de producto no válido');
        return;
    }

    console.log(`🔍 Buscando producto ID: ${productId}`);
    console.log('📊 Estado de Firebase:', {
        dbExists: !!window.db,
        firebaseExists: typeof firebase !== 'undefined',
        productId: productId
    });
    
    document.getElementById('loading').style.display = 'block';
    document.getElementById('error-message').style.display = 'none';
    document.getElementById('product-content').style.display = 'none';
    document.getElementById('product-tabs').style.display = 'none';
    document.getElementById('related-products').style.display = 'none';

    try {
        hasLoaded = true;
        
        const firebaseConnected = await testFirebaseConnection();
        
        if (!firebaseConnected) {
            console.warn('⚠️ Firebase no disponible, usando datos locales');
            currentProduct = await loadProductFromLocal(productId);
            if (currentProduct) {
                displayProductDetails();
                loadRelatedProducts();
                return;
            } else {
                throw new Error('Producto no encontrado en datos locales');
            }
        }
        
        console.log(`📡 Consultando Firestore para producto: ${productId}`);
        
        const productRef = window.db.collection('products').doc(productId);
        const productDoc = await productRef.get();
        
        console.log('📄 Resultado de la consulta:', {
            exists: productDoc.exists,
            id: productDoc.id,
            data: productDoc.data()
        });
        
        if (productDoc.exists) {
            const productData = productDoc.data();
            console.log('✅ Producto encontrado en Firestore:', productData.name);
            
            currentProduct = {
                id: productDoc.id,
                name: productData.name || 'Producto sin nombre',
                brand: productData.brand || 'Marca no especificada',
                description: productData.description || 'Sin descripción disponible',
                price: Number(productData.price) || 0,
                stock: Number(productData.stock) || 0,
                rating: Number(productData.rating) || 0,
                reviews: Number(productData.reviews) || 0,
                category: productData.category || 'palas',
                oldPrice: productData.oldPrice ? Number(productData.oldPrice) : null,
                images: productData.images || (productData.image ? [productData.image] : []),
                specifications: productData.specifications || {},
                active: productData.active !== undefined ? productData.active : true
            };
            
            console.log('📦 Producto procesado:', currentProduct);
            
            displayProductDetails();
            loadRelatedProducts();
            
        } else {
            console.warn(`⚠️ Producto ${productId} no encontrado en Firestore`);
            
            currentProduct = await loadProductFromLocal(productId);
            if (currentProduct) {
                console.log('✅ Producto encontrado en datos locales');
                displayProductDetails();
                loadRelatedProducts();
            } else {
                showErrorWithOptions(`El producto con ID "${productId}" no existe en nuestra base de datos.`);
            }
        }
        
    } catch (error) {
        console.error('❌ Error cargando producto:', error);
        
        let errorMessage = 'Error cargando el producto. ';
        
        if (error.message.includes('permission') || error.code === 'permission-denied') {
            errorMessage += 'Error de permisos. Verifica la configuración de Firestore.';
        } else if (error.message.includes('network')) {
            errorMessage += 'Error de red. Verifica tu conexión a internet.';
        } else if (error.message.includes('Producto no encontrado')) {
            errorMessage = error.message;
        } else {
            errorMessage += error.message;
        }
        
        showErrorWithOptions(errorMessage);
        
        hasLoaded = false;
    }
}

// Función mejorada para cargar producto desde datos locales
async function loadProductFromLocal(productId) {
    console.log(`🔍 Buscando producto local ID: ${productId}`);
    
    // PRODUCTOS LOCALES CON TUS URLs REALES
    const localProducts = [
        {
            id: '1',
            name: 'Pala Bullpadel Vertex 03',
            brand: 'Bullpadel',
            description: 'La Pala Bullpadel Vertex 03 es una pala de potencia media-alta diseñada para jugadores intermedios que buscan mejorar su juego.',
            price: 89990,
            oldPrice: 99990,
            stock: 15,
            rating: 4.5,
            reviews: 24,
            category: 'palas',
            images: [
                'https://firebasestorage.googleapis.com/v0/b/padelfuego.appspot.com/o/palas%2Fbullpadel-vertex.jpg?alt=media'
            ],
            specifications: {
                'Forma': 'Diamante',
                'Peso': '360-375g',
                'Balance': 'Alto',
                'Núcleo': 'Goma EVA'
            }
        },
        {
            id: '2',
            name: 'Pala Head Alpha Pro',
            brand: 'Head',
            description: 'La Pala Head Alpha Pro está diseñada para jugadores avanzados que buscan el máximo control en la pista.',
            price: 75990,
            stock: 8,
            rating: 4.3,
            reviews: 18,
            category: 'palas',
            images: [
                'https://firebasestorage.googleapis.com/v0/b/padelfuego.appspot.com/o/palas%2Fhead-alpha.jpg?alt=media'
            ],
            specifications: {
                'Forma': 'Redonda',
                'Peso': '355-370g',
                'Balance': 'Bajo',
                'Núcleo': 'Goma EVA High Density'
            }
        }
    ];
    
    const product = localProducts.find(p => p.id === productId);
    
    if (!product) {
        console.log(`⚠️ Producto ${productId} no encontrado en locales, mostrando producto demo`);
        
        return {
            id: productId,
            name: `Producto ${productId.substring(0, 8)}`,
            brand: 'Pádel Fuego',
            description: 'Este es un producto de demostración. Los detalles completos estarán disponibles próximamente.',
            price: 49990,
            stock: 10,
            rating: 4.0,
            reviews: 0,
            category: 'palas',
            images: [],
            specifications: {
                'Estado': 'Disponible',
                'Garantía': '30 días',
                'Envío': '3-5 días hábiles'
            }
        };
    }
    
    return product;
}

// ============================================
// FUNCIONES DE DISPLAY
// ============================================

// Mostrar detalles del producto
function displayProductDetails() {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('product-content').style.display = 'grid';
    document.getElementById('product-tabs').style.display = 'block';
    
    document.getElementById('current-product').textContent = currentProduct.name;
    document.getElementById('product-title').textContent = currentProduct.name;
    document.getElementById('product-brand').textContent = currentProduct.brand || 'Marca no especificada';
    
    document.getElementById('product-price').textContent = `$${currentProduct.price.toLocaleString('es-AR')}`;
    
    if (currentProduct.oldPrice) {
        document.getElementById('discount-container').style.display = 'block';
        document.getElementById('old-price').textContent = `$${currentProduct.oldPrice.toLocaleString('es-AR')}`;
        const discount = Math.round(((currentProduct.oldPrice - currentProduct.price) / currentProduct.oldPrice) * 100);
        document.getElementById('discount-badge').textContent = `${discount}% OFF`;
    }
    
    document.getElementById('rating-value').textContent = currentProduct.rating.toFixed(1);
    document.getElementById('reviews-count').textContent = `(${currentProduct.reviews || 0} reseñas)`;
    
    const starsContainer = document.getElementById('rating-stars');
    starsContainer.innerHTML = getStarsHTML(currentProduct.rating);
    
    document.getElementById('short-description').textContent = 
        currentProduct.description.substring(0, 150) + (currentProduct.description.length > 150 ? '...' : '');
    
    document.getElementById('full-description').textContent = currentProduct.description;
    
    updateStockDisplay(currentProduct.stock);
    
    displayProductImages();
    
    displaySpecifications();
    
    setupQuantityControls();
    
    setupActionButtons();
    
    setupTabs();
}

// Actualizar display de stock
function updateStockDisplay(stock) {
    const stockElement = document.getElementById('stock-status');
    const maxQuantityElement = document.getElementById('max-quantity');
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    
    maxQuantityElement.textContent = Math.min(stock, 10);
    
    if (stock > 10) {
        stockElement.textContent = 'En stock';
        stockElement.className = 'in-stock';
        addToCartBtn.disabled = false;
    } else if (stock > 0) {
        stockElement.textContent = `Solo ${stock} unidades disponibles`;
        stockElement.className = 'low-stock';
        addToCartBtn.disabled = false;
    } else {
        stockElement.textContent = 'Agotado';
        stockElement.className = 'out-of-stock';
        addToCartBtn.disabled = true;
        addToCartBtn.textContent = 'Producto Agotado';
    }
}

// Mostrar imágenes del producto
function displayProductImages() {
    const mainImage = document.getElementById('main-product-image');
    const thumbnailsContainer = document.getElementById('thumbnail-images');
    
    let images = [];
    
    if (currentProduct.images && Array.isArray(currentProduct.images)) {
        images = currentProduct.images.filter(img => 
            img && typeof img === 'string' && 
            (img.startsWith('http://') || img.startsWith('https://'))
        );
    }
    
    if (currentProduct.image && typeof currentProduct.image === 'string' && 
        (currentProduct.image.startsWith('http://') || currentProduct.image.startsWith('https://'))) {
        if (!images.includes(currentProduct.image)) {
            images.unshift(currentProduct.image);
        }
    }
    
    if (images.length === 0) {
        console.warn('⚠️ Producto sin imágenes, usando placeholder simple');
        const productName = encodeURIComponent(currentProduct.name.substring(0, 20));
        const color = currentProduct.category === 'palas' ? '2c5530' : 
                     currentProduct.category === 'accesorios' ? '4a7c59' : 'ff6b35';
        
        const svgPlaceholder = `
            <svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
                <rect width="100%" height="100%" fill="#${color}"/>
                <text x="50%" y="50%" font-family="Arial" font-size="24" fill="white" 
                      text-anchor="middle" dy=".3em">${currentProduct.name}</text>
            </svg>`;
        
        const svgDataUrl = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svgPlaceholder);
        images = [svgDataUrl];
    }
    
    currentImages = images;
    
    // Configurar imagen principal
    mainImage.src = images[0];
    mainImage.alt = currentProduct.name;
    
    // Inicializar data attributes para el zoom
    mainImage.dataset.currentImage = images[0];
    mainImage.dataset.currentIndex = 0;
    
    // Añadir evento para zoom (directo desde la imagen principal)
    mainImage.onclick = () => {
        const currentImage = mainImage.dataset.currentImage || mainImage.src;
        openImageZoom(currentImage);
    };
    
    // Manejo de error para imagen principal
    mainImage.onerror = function() {
        console.warn('⚠️ Error cargando imagen principal, usando fallback');
        this.onerror = null;
        const productName = encodeURIComponent(currentProduct.name.substring(0, 20));
        const color = currentProduct.category === 'palas' ? '2c5530' : 
                     currentProduct.category === 'accesorios' ? '4a7c59' : 'ff6b35';
        
        const svgPlaceholder = `
            <svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
                <rect width="100%" height="100%" fill="#${color}"/>
                <text x="50%" y="50%" font-family="Arial" font-size="24" fill="white" 
                      text-anchor="middle" dy=".3em">${currentProduct.name}</text>
            </svg>`;
        
        const fallbackUrl = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svgPlaceholder);
        this.src = fallbackUrl;
        this.dataset.currentImage = fallbackUrl;
    };
    
    // Limpiar miniaturas
    thumbnailsContainer.innerHTML = '';
    
    // Crear miniaturas con funcionalidad CORREGIDA
    images.forEach((image, index) => {
        const thumbnail = document.createElement('img');
        thumbnail.className = 'thumbnail' + (index === 0 ? ' active' : '');
        thumbnail.src = image;
        thumbnail.alt = `${currentProduct.name} - Vista ${index + 1}`;
        thumbnail.dataset.imageIndex = index;
        thumbnail.dataset.fullImage = image;
        
        // Evento para cambiar imagen principal
        thumbnail.onclick = (e) => {
            e.stopPropagation(); // Prevenir propagación
            switchMainImage(image, index);
            
            // También actualizar el índice de zoom actual
            currentZoomIndex = index;
            updateZoomButtons();
        };
        
        // Manejo de error para miniaturas
        thumbnail.onerror = function() {
            console.warn(`⚠️ Error cargando thumbnail ${index}`);
            this.style.display = 'none';
        };
        
        thumbnailsContainer.appendChild(thumbnail);
    });
    
    console.log(`🖼️ ${images.length} imágenes cargadas para el producto`);
}

// Cambiar imagen principal CORREGIDO
function switchMainImage(imageSrc, index) {
    const mainImage = document.getElementById('main-product-image');
    const thumbnails = document.querySelectorAll('.thumbnail');
    
    // Actualizar imagen principal
    mainImage.src = imageSrc;
    mainImage.alt = currentProduct.name;
    
    // Guardar la imagen actual en un data attribute para el zoom
    mainImage.dataset.currentImage = imageSrc;
    mainImage.dataset.currentIndex = index;
    
    // Actualizar clases activas en miniaturas
    thumbnails.forEach((thumb, i) => {
        thumb.classList.toggle('active', i === index);
    });
    
    // Scroll a la miniatura activa si es necesario
    const activeThumb = thumbnails[index];
    if (activeThumb) {
        activeThumb.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center'
        });
    }
    
    console.log(`🖼️ Cambiada imagen principal a índice ${index}: ${imageSrc}`);
}

// Zoom de imagen CORREGIDO
function openImageZoom(imageSrc = null) {
    const overlay = document.getElementById('image-zoom-overlay');
    const zoomedImage = document.getElementById('zoomed-image');
    
    // Determinar qué imagen mostrar en el zoom
    let imageToZoom;
    
    if (imageSrc) {
        // Si se pasa una imagen específica (desde miniatura)
        imageToZoom = imageSrc;
        const index = currentImages.findIndex(img => img === imageSrc);
        currentZoomIndex = index >= 0 ? index : 0;
    } else {
        // Si se llama desde la imagen principal, usar la actual
        const mainImage = document.getElementById('main-product-image');
        imageToZoom = mainImage.dataset.currentImage || mainImage.src;
        
        // Buscar el índice
        const index = currentImages.findIndex(img => img === imageToZoom);
        currentZoomIndex = index >= 0 ? index : 0;
    }
    
    console.log(`🔍 Abriendo zoom con imagen ${currentZoomIndex}: ${imageToZoom}`);
    
    // Cargar la imagen en el zoom
    zoomedImage.src = imageToZoom;
    zoomedImage.alt = currentProduct.name;
    overlay.style.display = 'flex';
    
    // Actualizar botones de navegación
    updateZoomButtons();
    
    // Añadir clase para prevenir scroll del body
    document.body.style.overflow = 'hidden';
}

// Cerrar zoom
function closeImageZoom() {
    const overlay = document.getElementById('image-zoom-overlay');
    overlay.style.display = 'none';
    
    // Restaurar scroll del body
    document.body.style.overflow = '';
}

// Mostrar especificaciones
function displaySpecifications() {
    const specsTable = document.getElementById('specs-table');
    specsTable.innerHTML = '';
    
    if (currentProduct.specifications && Object.keys(currentProduct.specifications).length > 0) {
        Object.entries(currentProduct.specifications).forEach(([key, value]) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${key}</td>
                <td>${value}</td>
            `;
            specsTable.appendChild(row);
        });
    } else {
        specsTable.innerHTML = `
            <tr>
                <td colspan="2" style="text-align: center; color: #666; padding: 30px;">
                    No hay especificaciones disponibles para este producto.
                </td>
            </tr>
        `;
    }
}

// Configurar controles de cantidad
function setupQuantityControls() {
    const decreaseBtn = document.getElementById('decrease-qty');
    const increaseBtn = document.getElementById('increase-qty');
    const quantityInput = document.getElementById('quantity');
    const maxQuantity = Math.min(currentProduct.stock, 10);
    
    quantityInput.value = 1;
    quantityInput.max = maxQuantity;
    
    decreaseBtn.onclick = () => {
        const current = parseInt(quantityInput.value);
        if (current > 1) {
            quantityInput.value = current - 1;
            updateQuantityButtons();
        }
    };
    
    increaseBtn.onclick = () => {
        const current = parseInt(quantityInput.value);
        if (current < maxQuantity) {
            quantityInput.value = current + 1;
            updateQuantityButtons();
        }
    };
    
    quantityInput.onchange = () => {
        let value = parseInt(quantityInput.value);
        if (isNaN(value) || value < 1) value = 1;
        if (value > maxQuantity) value = maxQuantity;
        quantityInput.value = value;
        updateQuantityButtons();
    };
    
    function updateQuantityButtons() {
        const current = parseInt(quantityInput.value);
        decreaseBtn.disabled = current <= 1;
        increaseBtn.disabled = current >= maxQuantity;
    }
    
    updateQuantityButtons();
}

// Configurar botones de acción
function setupActionButtons() {
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    const wishlistBtn = document.getElementById('wishlist-btn');
    
    addToCartBtn.onclick = () => {
        const quantity = parseInt(document.getElementById('quantity').value);
        addToCart(currentProduct.id, currentProduct.name, currentProduct.price, currentProduct.stock, quantity);
    };
    
    wishlistBtn.onclick = () => {
        addToWishlist();
    };
}

// Configurar pestañas
function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `${tabId}-content`) {
                    content.classList.add('active');
                }
            });
        });
    });
}

// ============================================
// FUNCIONES DEL CARRITO
// ============================================

// Inicializar carrito
function initCart() {
    console.log('🛒 Inicializando carrito en product-details...');
    
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
    } else {
        cart = [];
    }
    
    // Actualizar contador
    updateCartCounter();
}

// Función para agregar al carrito
function addToCart(productId, productName, productPrice, productStock, quantity = 1) {
    try {
        console.log(`🛒 Agregando ${quantity} ${productName} al carrito`);
        
        // Cargar carrito actual desde localStorage
        let cart = JSON.parse(localStorage.getItem('padelCart')) || [];
        
        const existingIndex = cart.findIndex(item => item.id === productId);
        
        if (existingIndex >= 0) {
            // Si ya existe, aumentar cantidad
            cart[existingIndex].quantity += quantity;
            alert(`+${quantity} ${productName} (total: ${cart[existingIndex].quantity})`);
        } else {
            // Si no existe, agregar nuevo
            cart.push({
                id: productId,
                name: productName,
                price: productPrice,
                quantity: quantity,
                maxStock: Math.min(productStock, 10)
            });
            alert(`✅ ${productName} agregado al carrito`);
        }
        
        // Guardar carrito actualizado
        localStorage.setItem('padelCart', JSON.stringify(cart));
        
        // Actualizar variable global
        window.cart = cart;
        
        // Actualizar contador
        updateCartCounter();
        
        // Si el carrito está abierto, actualizar vista
        if (cartOpen) {
            renderCart();
        }
        
    } catch (error) {
        console.error('Error agregando al carrito:', error);
        alert('❌ Error al agregar producto al carrito');
    }
}

// Función para agregar a favoritos
function addToWishlist() {
    try {
        let wishlist = JSON.parse(localStorage.getItem('padelWishlist')) || [];
        
        const alreadyExists = wishlist.some(item => item.id === currentProduct.id);
        
        if (alreadyExists) {
            alert('⚠️ Este producto ya está en tus favoritos');
        } else {
            wishlist.push({
                id: currentProduct.id,
                name: currentProduct.name,
                price: currentProduct.price,
                image: currentImages[0]
            });
            
            localStorage.setItem('padelWishlist', JSON.stringify(wishlist));
            alert('❤️ Producto agregado a favoritos');
        }
    } catch (error) {
        console.error('Error agregando a favoritos:', error);
        alert('Error al agregar a favoritos');
    }
}

// Alternar carrito
function toggleCart() {
    const modal = document.getElementById('cart-modal');
    if (!modal) {
        console.error('❌ Modal del carrito no encontrado');
        return;
    }
    
    cartOpen = !cartOpen;
    if (cartOpen) {
        modal.style.display = 'flex';
        renderCart();
    } else {
        modal.style.display = 'none';
    }
}

// Renderizar carrito
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
    
    let total = 0;
    let totalItems = 0;
    
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
                </div>
                <div class="cart-item-controls">
                    <button onclick="updateCartItemQuantity(${index}, -1)" ${item.quantity <= 1 ? 'disabled style="opacity: 0.5;"' : ''}>−</button>
                    <span class="cart-item-quantity">${item.quantity}</span>
                    <button onclick="updateCartItemQuantity(${index}, 1)">+</button>
                    <button class="remove-btn" onclick="removeCartItem(${index})">🗑️</button>
                </div>
                <div class="cart-item-subtotal">
                    Subtotal: $${subtotal.toLocaleString('es-AR')}
                </div>
            </div>
        `;
        cartItems.insertAdjacentHTML('beforeend', itemHTML);
    });
    
    cartTotal.textContent = `$${total.toLocaleString('es-AR')}`;
    
    if (cartCounter) {
        cartCounter.textContent = totalItems.toString();
        cartCounter.style.display = totalItems > 0 ? 'inline-block' : 'none';
    }
    
    localStorage.setItem('padelCart', JSON.stringify(cart));
}

// Actualizar cantidad de item en carrito
function updateCartItemQuantity(index, change) {
    if (!cart[index]) return;
    
    const newQuantity = cart[index].quantity + change;
    
    if (newQuantity < 1) {
        removeCartItem(index);
    } else {
        // Verificar stock máximo
        if (cart[index].maxStock && newQuantity > cart[index].maxStock) {
            alert(`Máximo disponible: ${cart[index].maxStock} unidades`);
            return;
        }
        cart[index].quantity = newQuantity;
        renderCart();
    }
}

// Eliminar item del carrito
function removeCartItem(index) {
    if (!cart[index]) return;
    
    const productName = cart[index].name;
    cart.splice(index, 1);
    renderCart();
    alert(`${productName} eliminado del carrito`);
}

// Vaciar carrito
function clearCart() {
    if (cart.length === 0) {
        alert('El carrito ya está vacío');
        return;
    }
    
    if (confirm('¿Estás seguro de vaciar todo el carrito?')) {
        cart = [];
        renderCart();
        alert('Carrito vaciado');
    }
}

// Checkout
function checkout() {
    if (cart.length === 0) {
        alert('Tu carrito está vacío');
        return;
    }
    
    // Redirigir a checkout
    window.location.href = 'checkout.html';
}

// Actualizar contador del carrito
function updateCartCounter() {
    const counter = document.getElementById('cart-counter');
    if (!counter) return;
    
    // Recalcular total de items
    const savedCart = JSON.parse(localStorage.getItem('padelCart') || '[]');
    const totalItems = savedCart.reduce((sum, item) => sum + item.quantity, 0);
    
    counter.textContent = totalItems.toString();
    counter.style.display = totalItems > 0 ? 'inline-block' : 'none';
    
    // Actualizar variable global
    cart = savedCart;
}

// ============================================
// FUNCIONES DE PRODUCTOS RELACIONADOS
// ============================================

// Cargar productos relacionados
async function loadRelatedProducts() {
    const relatedGrid = document.getElementById('related-grid');
    const relatedContainer = document.getElementById('related-products');
    
    try {
        relatedProducts = [];
        
        console.log('🔍 INICIANDO CARGA DE PRODUCTOS RELACIONADOS...');
        console.log('📊 Estado actual:', {
            currentProduct: currentProduct ? currentProduct.name : 'null',
            category: currentProduct ? currentProduct.category : 'null',
            dbAvailable: !!window.db
        });
        
        // Intentar cargar desde Firestore si está disponible
        if (window.db && currentProduct && currentProduct.category) {
            try {
                console.log(`📡 CONSULTANDO FIRESTORE para productos de categoría: "${currentProduct.category}"`);
                console.log(`🎯 Producto actual excluido: ${currentProduct.id} - ${currentProduct.name}`);
                
                // Hacer la consulta a Firestore
                const snapshot = await window.db.collection('products')
                    .where('category', '==', currentProduct.category)
                    .limit(6) // Aumentar límite para tener más opciones
                    .get();
                
                console.log(`📊 Resultado de Firestore: ${snapshot.size} productos encontrados`);
                
                if (!snapshot.empty) {
                    // Filtrar el producto actual y mapear los resultados
                    relatedProducts = snapshot.docs
                        .filter(doc => doc.id !== currentProduct.id)
                        .map(doc => {
                            const data = doc.data();
                            console.log(`📄 Producto encontrado: ${doc.id} - ${data.name || 'Sin nombre'}`);
                            
                            return {
                                id: doc.id,
                                name: data.name || 'Producto sin nombre',
                                price: Number(data.price) || 0,
                                brand: data.brand || 'Marca no especificada',
                                image: data.image || data.images?.[0] || '',
                                rating: Number(data.rating) || 0,
                                stock: Number(data.stock) || 0,
                                category: data.category || 'palas',
                                description: data.description || ''
                            };
                        });
                    
                    console.log(`✅ ${relatedProducts.length} productos relacionados después de filtrar`);
                    
                    // Si no hay suficientes, intentar buscar por marca
                    if (relatedProducts.length < 2 && currentProduct.brand) {
                        console.log(`🔍 Pocos productos de la misma categoría, buscando por marca: "${currentProduct.brand}"`);
                        await loadRelatedByBrand();
                    }
                    
                } else {
                    console.warn('⚠️ No se encontraron productos en Firestore para esta categoría');
                    // Intentar buscar por marca si la categoría no funciona
                    if (currentProduct.brand) {
                        await loadRelatedByBrand();
                    }
                }
                
            } catch (firestoreError) {
                console.error('❌ Error en consulta a Firestore:', firestoreError);
                console.error('Detalles del error:', {
                    code: firestoreError.code,
                    message: firestoreError.message,
                    stack: firestoreError.stack
                });
            }
        } else {
            console.log('⚠️ Firestore no disponible o sin categoría, usando datos locales');
        }
        
        // Si no hay suficientes productos en Firestore, usar datos locales
        if (!relatedProducts.length || relatedProducts.length < 2) {
            console.log('🔄 Usando productos relacionados locales');
            relatedProducts = await getLocalRelatedProducts();
        }
        
        // Si hay productos relacionados, mostrarlos
        if (relatedProducts.length > 0) {
            console.log(`🎯 Mostrando ${relatedProducts.length} productos relacionados`);
            relatedContainer.style.display = 'block';
            displayRelatedProducts();
        } else {
            console.log('ℹ️ No hay productos relacionados disponibles');
            relatedContainer.style.display = 'none';
        }
        
    } catch (error) {
        console.error('❌ Error general cargando productos relacionados:', error);
        document.getElementById('related-products').style.display = 'none';
    }
}

// Función para cargar productos relacionados por marca
async function loadRelatedByBrand() {
    try {
        console.log(`🔍 Buscando productos de la marca: "${currentProduct.brand}"`);
        
        const snapshot = await window.db.collection('products')
            .where('brand', '==', currentProduct.brand)
            .limit(4)
            .get();
        
        console.log(`📊 Resultado por marca: ${snapshot.size} productos encontrados`);
        
        if (!snapshot.empty) {
            const brandProducts = snapshot.docs
                .filter(doc => doc.id !== currentProduct.id)
                .map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        name: data.name || 'Producto sin nombre',
                        price: Number(data.price) || 0,
                        brand: data.brand || 'Marca no especificada',
                        image: data.image || data.images?.[0] || '',
                        rating: Number(data.rating) || 0,
                        stock: Number(data.stock) || 0,
                        category: data.category || 'palas'
                    };
                });
            
            // Agregar a los productos relacionados existentes
            relatedProducts = [...relatedProducts, ...brandProducts];
            
            // Eliminar duplicados
            const uniqueIds = new Set();
            relatedProducts = relatedProducts.filter(product => {
                if (uniqueIds.has(product.id)) {
                    return false;
                }
                uniqueIds.add(product.id);
                return true;
            });
            
            console.log(`✅ Total después de agregar por marca: ${relatedProducts.length} productos`);
        }
    } catch (error) {
        console.error('❌ Error cargando por marca:', error);
    }
}

// Función mejorada para productos relacionados locales
async function getLocalRelatedProducts() {
    try {
        console.log('🔍 Buscando productos relacionados en datos locales...');
        
        // PRODUCTOS CON URLs REALES - DATOS DE EJEMPLO
        const allLocalProducts = [
            {
                id: '1',
                name: 'Pala Bullpadel Vertex 03',
                price: 89990,
                brand: 'Bullpadel',
                category: 'palas',
                image: 'https://firebasestorage.googleapis.com/v0/b/padelfuego.appspot.com/o/palas%2Fbullpadel-vertex.jpg?alt=media',
                rating: 4.5,
                stock: 15,
                description: 'Pala de potencia media-alta'
            },
            {
                id: '2',
                name: 'Pala Head Alpha Pro',
                price: 75990,
                brand: 'Head',
                category: 'palas',
                image: 'https://firebasestorage.googleapis.com/v0/b/padelfuego.appspot.com/o/palas%2Fhead-alpha.jpg?alt=media',
                rating: 4.3,
                stock: 8,
                description: 'Pala para control avanzado'
            },
            {
                id: '3',
                name: 'Pelotas Head Padel Pro',
                price: 12990,
                brand: 'Head',
                category: 'accesorios',
                image: 'https://firebasestorage.googleapis.com/v0/b/padelfuego.appspot.com/o/accesorios%2Fpelotas-head.jpg?alt=media',
                rating: 4.7,
                stock: 50,
                description: 'Pelotas profesionales'
            },
            {
                id: '4',
                name: 'Mochila Bullpadel Advance',
                price: 34990,
                brand: 'Bullpadel',
                category: 'accesorios',
                image: 'https://firebasestorage.googleapis.com/v0/b/padelfuego.appspot.com/o/accesorios%2Fmochila-bullpadel.jpg?alt=media',
                rating: 4.2,
                stock: 12,
                description: 'Mochila para equipo completo'
            },
            {
                id: '5',
                name: 'Zapatos Asics Gel-Padel Pro',
                price: 55990,
                brand: 'Asics',
                category: 'accesorios',
                image: 'https://firebasestorage.googleapis.com/v0/b/padelfuego.appspot.com/o/accesorios%2Fzapatos-asics.jpg?alt=media',
                rating: 4.6,
                stock: 6,
                description: 'Zapatos profesionales para pádel'
            }
        ];
        
        // Filtrar productos relacionados
        let filteredProducts = [];
        
        if (currentProduct && currentProduct.category) {
            // Primero por misma categoría
            filteredProducts = allLocalProducts.filter(p => 
                p.category === currentProduct.category && p.id !== currentProduct.id
            );
            
            console.log(`📊 Productos de misma categoría: ${filteredProducts.length}`);
            
            // Si no hay suficientes, agregar de misma marca
            if (filteredProducts.length < 2 && currentProduct.brand) {
                const brandProducts = allLocalProducts.filter(p => 
                    p.brand === currentProduct.brand && 
                    p.id !== currentProduct.id &&
                    !filteredProducts.some(fp => fp.id === p.id)
                );
                filteredProducts = [...filteredProducts, ...brandProducts];
                console.log(`📊 Después de agregar por marca: ${filteredProducts.length}`);
            }
        }
        
        // Si aún no hay suficientes, mostrar productos aleatorios
        if (filteredProducts.length < 2) {
            const randomProducts = allLocalProducts
                .filter(p => p.id !== currentProduct.id)
                .sort(() => Math.random() - 0.5)
                .slice(0, 3);
            
            // Combinar sin duplicados
            const existingIds = new Set(filteredProducts.map(p => p.id));
            randomProducts.forEach(p => {
                if (!existingIds.has(p.id)) {
                    filteredProducts.push(p);
                    existingIds.add(p.id);
                }
            });
            
            console.log(`📊 Después de agregar aleatorios: ${filteredProducts.length}`);
        }
        
        return filteredProducts.slice(0, 4); // Máximo 4 productos
        
    } catch (error) {
        console.error('❌ Error obteniendo productos locales:', error);
        return [];
    }
}

// Mostrar productos relacionados
function displayRelatedProducts() {
    const relatedGrid = document.getElementById('related-grid');
    
    if (!relatedGrid) {
        console.error('❌ No se encontró el contenedor de productos relacionados');
        return;
    }
    
    // Limpiar contenedor
    relatedGrid.innerHTML = '';
    
    if (relatedProducts.length === 0) {
        relatedGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #666;">
                No hay productos relacionados disponibles.
            </div>
        `;
        return;
    }
    
    // Crear tarjetas de productos
    relatedProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card related-product-card';
        productCard.style.cursor = 'pointer';
        productCard.style.border = '1px solid #eee';
        productCard.style.borderRadius = '10px';
        productCard.style.padding = '15px';
        productCard.style.transition = 'all 0.3s';
        productCard.style.background = 'white';
        
        productCard.onmouseenter = () => {
            productCard.style.transform = 'translateY(-5px)';
            productCard.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
        };
        
        productCard.onmouseleave = () => {
            productCard.style.transform = 'translateY(0)';
            productCard.style.boxShadow = 'none';
        };
        
        productCard.onclick = () => {
            window.location.href = `product-details.html?id=${product.id}`;
        };
        
        // Función para crear placeholder SVG
        function createSVGPlaceholder(productName, category) {
            const color = category === 'palas' ? '2c5530' : 
                         category === 'accesorios' ? '4a7c59' : 'ff6b35';
            
            const svg = `<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
                <rect width="100%" height="100%" fill="#${color}"/>
                <text x="50%" y="50%" font-family="Arial" font-size="16" fill="white" 
                      text-anchor="middle" dy=".3em">${productName.substring(0, 30)}</text>
            </svg>`;
            
            return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
        }
        
        // Determinar URL de imagen
        let imageUrl = product.image || '';
        const placeholder = createSVGPlaceholder(product.name, product.category);
        
        productCard.innerHTML = `
            <div class="product-image" style="height: 200px; overflow: hidden; border-radius: 8px; margin-bottom: 15px;">
                <img src="${imageUrl || placeholder}" 
                     alt="${product.name}" 
                     style="width: 100%; height: 100%; object-fit: cover;"
                     loading="lazy"
                     onerror="
                         if (this.src !== '${placeholder}') {
                             this.src = '${placeholder}';
                         }
                     ">
            </div>
            <h3 style="margin: 0 0 5px 0; font-size: 1.1rem; color: #333;">${product.name}</h3>
            <p class="brand" style="margin: 0 0 10px 0; color: #666; font-size: 0.9rem;">${product.brand}</p>
            <div class="price" style="font-weight: bold; color: #2c5530; font-size: 1.2rem; margin-bottom: 8px;">
                $${product.price.toLocaleString('es-AR')}
            </div>
            <div class="rating" style="color: #ffb400; margin-bottom: 15px;">
                ${getStarsHTML(product.rating || 0)} <span style="color: #666; font-size: 0.9rem;">${(product.rating || 0).toFixed(1)}/5</span>
            </div>
            <button class="add-to-cart" 
                    onclick="event.stopPropagation(); 
                             addToCart('${product.id}', '${product.name.replace(/'/g, "\\'")}', ${product.price}, ${product.stock || 10}, 1);"
                    style="width: 100%; padding: 10px; background: #2c5530; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; transition: background 0.3s;">
                Agregar al Carrito
            </button>
        `;
        
        // Añadir hover effect al botón
        const button = productCard.querySelector('.add-to-cart');
        if (button) {
            button.onmouseenter = () => button.style.background = '#1e3a23';
            button.onmouseleave = () => button.style.background = '#2c5530';
        }
        
        relatedGrid.appendChild(productCard);
    });
    
    console.log(`✅ Mostrados ${relatedProducts.length} productos relacionados`);
}

// ============================================
// FUNCIONES DE NAVEGACIÓN DE ZOOM
// ============================================

// Función para actualizar botones de navegación del zoom
function updateZoomButtons() {
    const prevBtn = document.getElementById('prev-image');
    const nextBtn = document.getElementById('next-image');
    
    if (prevBtn) {
        prevBtn.style.display = currentImages.length > 1 ? 'flex' : 'none';
        prevBtn.disabled = currentZoomIndex <= 0;
    }
    
    if (nextBtn) {
        nextBtn.style.display = currentImages.length > 1 ? 'flex' : 'none';
        nextBtn.disabled = currentZoomIndex >= currentImages.length - 1;
    }
}

// Configurar navegación del zoom
function setupZoomNavigation() {
    const prevBtn = document.getElementById('prev-image');
    const nextBtn = document.getElementById('next-image');
    const zoomedImage = document.getElementById('zoomed-image');
    
    if (!prevBtn || !nextBtn || !zoomedImage) return;
    
    // Navegar a imagen anterior
    prevBtn.onclick = () => {
        if (currentZoomIndex > 0) {
            currentZoomIndex--;
            zoomedImage.src = currentImages[currentZoomIndex];
            updateZoomButtons();
        }
    };
    
    // Navegar a siguiente imagen
    nextBtn.onclick = () => {
        if (currentZoomIndex < currentImages.length - 1) {
            currentZoomIndex++;
            zoomedImage.src = currentImages[currentZoomIndex];
            updateZoomButtons();
        }
    };
    
    // Teclado shortcuts para navegación
    document.addEventListener('keydown', (e) => {
        const overlay = document.getElementById('image-zoom-overlay');
        if (overlay && overlay.style.display === 'flex') {
            if (e.key === 'ArrowLeft' && prevBtn && !prevBtn.disabled) {
                prevBtn.click();
            } else if (e.key === 'ArrowRight' && nextBtn && !nextBtn.disabled) {
                nextBtn.click();
            }
        }
    });
}

// ============================================
// INICIALIZACIÓN
// ============================================

// Función principal de inicialización
function initializePage() {
    console.log('🚀 Inicializando página de detalles del producto...');
    
    // Inicializar carrito PRIMERO
    initCart();
    
    const closeZoomBtn = document.getElementById('close-zoom');
    const zoomOverlay = document.getElementById('image-zoom-overlay');
    
    if (closeZoomBtn) closeZoomBtn.onclick = closeImageZoom;
    if (zoomOverlay) {
        zoomOverlay.onclick = (e) => {
            if (e.target === zoomOverlay) closeImageZoom();
        };
    }
    
    // Configurar navegación del zoom
    setupZoomNavigation();
    
    // Configurar teclas de escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (cartOpen) {
                toggleCart();
            } else {
                closeImageZoom();
            }
        }
    });
    
    // Cerrar carrito al hacer clic fuera
    document.addEventListener('click', (e) => {
        const modal = document.getElementById('cart-modal');
        if (modal && cartOpen && !modal.contains(e.target) && 
            !e.target.closest('.cart-link')) {
            toggleCart();
        }
    });
    
    const productId = getProductIdFromURL();
    if (!productId) {
        showErrorWithOptions('No se especificó un producto válido.');
        return;
    }
    
    console.log(`🎯 Producto a cargar: ${productId}`);
    
    if (window.db) {
        console.log('✅ Firebase ya está disponible, cargando producto...');
        db = window.db;
        loadProduct();
    } else {
        console.log('⏳ Esperando a que Firebase esté listo...');
    }
}

// ============================================
// EVENT LISTENERS
// ============================================

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePage);
} else {
    initializePage();
}

// Escuchar evento de Firebase listo
document.addEventListener('firebaseReady', () => {
    console.log('🔥 Evento firebaseReady recibido');
    
    if (window.db) {
        db = window.db;
        console.log('✅ DB asignado desde evento');
        
        if (!hasLoaded && !currentProduct) {
            console.log('🔄 Firebase listo, cargando producto...');
            loadProduct();
        }
    }
});

// ============================================
// FUNCIONES DE DEPURACIÓN
// ============================================

// Depuración manual de Firestore
window.debugFirestore = async function() {
    console.log('=== DEBUG FIRESTORE ===');
    
    if (!window.db) {
        console.error('Firestore no disponible');
        return;
    }
    
    try {
        // Obtener todos los productos
        const snapshot = await window.db.collection('products').get();
        console.log(`Total productos: ${snapshot.size}`);
        
        snapshot.forEach(doc => {
            const data = doc.data();
            console.log(`📦 ${doc.id}: ${data.name || 'Sin nombre'}`, {
                category: data.category,
                active: data.active,
                brand: data.brand
            });
        });
        
        // Verificar consulta de productos relacionados
        if (currentProduct && currentProduct.category) {
            console.log(`\n🔍 Probando consulta para categoría: "${currentProduct.category}"`);
            const relatedQuery = await window.db.collection('products')
                .where('category', '==', currentProduct.category)
                .limit(3)
                .get();
            
            console.log(`Resultados: ${relatedQuery.size} productos`);
            relatedQuery.forEach(doc => {
                console.log(`- ${doc.id}: ${doc.data().name}`);
            });
        }
        
    } catch (error) {
        console.error('Error en depuración:', error);
    }
};

// Ejecutar depuración automáticamente después de cargar
setTimeout(() => {
    if (window.db && currentProduct) {
        console.log('Ejecutando depuración automática...');
        window.debugFirestore();
    }
}, 5000);

// ============================================
// EXPORTAR FUNCIONES GLOBALES
// ============================================
window.addToCart = addToCart;
window.switchMainImage = switchMainImage;
window.openImageZoom = openImageZoom;
window.closeImageZoom = closeImageZoom;
window.tryAlternativeProduct = tryAlternativeProduct;
window.retryLoadProduct = retryLoadProduct;
window.loadProduct = loadProduct;
window.toggleCart = toggleCart;
window.updateCartItemQuantity = updateCartItemQuantity;
window.removeCartItem = removeCartItem;
window.clearCart = clearCart;
window.checkout = checkout;
window.updateCartCounter = updateCartCounter;