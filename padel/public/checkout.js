// Variables globales
let cart = [];
let db = null;
let isProcessingOrder = false;
let proceedWithLowStockFlag = false;

// ============================================
// FUNCIONES DE INICIALIZACIÓN
// ============================================

// Inicializar Firebase
function initFirebaseCheckout() {
    console.log('🔥 Inicializando Firebase para checkout...');
    
    if (typeof firebase !== 'undefined' && window.initFirebase) {
        if (!window.db) {
            window.initFirebase();
        }
        db = window.db;
        console.log('✅ Firebase listo para checkout:', !!db);
    } else {
        console.warn('⚠️ Firebase no disponible para checkout');
    }
}

// Validar y reparar datos del carrito
function validateAndRepairCart() {
    console.log('🔍 Validando carrito...');
    
    try {
        const cartData = localStorage.getItem('padelCart');
        
        if (!cartData || cartData === 'undefined' || cartData === 'null') {
            console.warn('❌ Carrito no encontrado o inválido');
            cart = [];
            return false;
        }
        
        cart = JSON.parse(cartData);
        
        if (!Array.isArray(cart)) {
            console.error('❌ Carrito no es un array');
            cart = [];
            return false;
        }
        
        console.log(`✅ Carrito validado: ${cart.length} productos`);
        return true;
        
    } catch (error) {
        console.error('❌ Error validando carrito:', error);
        cart = [];
        return false;
    }
}

// Mostrar/ocultar mensaje de error
function showError(message, duration = 5000) {
    const errorEl = document.getElementById('error-message');
    if (!errorEl) return;
    
    errorEl.textContent = message;
    errorEl.classList.add('show');
    
    setTimeout(() => {
        errorEl.classList.remove('show');
    }, duration);
}

// Mostrar/ocultar mensaje de carrito vacío
function toggleEmptyCartMessage(show) {
    const emptyMsg = document.getElementById('empty-cart-message');
    const orderItems = document.getElementById('order-items');
    const orderTotal = document.querySelector('.order-total');
    
    if (emptyMsg && orderItems && orderTotal) {
        emptyMsg.style.display = show ? 'block' : 'none';
        orderItems.style.display = show ? 'none' : 'block';
        orderTotal.style.display = show ? 'none' : 'block';
    }
}

// ============================================
// FUNCIONES DE CALCULO Y DISPLAY
// ============================================

// Actualizar resumen del pedido
function updateOrderSummary() {
    console.log('📊 Actualizando resumen del pedido...');
    
    const orderItems = document.getElementById('order-items');
    const subtotalEl = document.getElementById('subtotal');
    const shippingEl = document.getElementById('shipping');
    const grandTotalEl = document.getElementById('grand-total');
    
    if (!cart || cart.length === 0) {
        console.log('🛒 Carrito vacío');
        orderItems.innerHTML = '';
        subtotalEl.textContent = '$0';
        shippingEl.textContent = '$0';
        grandTotalEl.textContent = '$0';
        toggleEmptyCartMessage(true);
        return;
    }
    
    toggleEmptyCartMessage(false);
    
    let subtotal = 0;
    let html = '';
    
    cart.forEach(item => {
        const price = Number(item.price) || 0;
        const quantity = Number(item.quantity) || 1;
        const itemTotal = price * quantity;
        
        subtotal += itemTotal;
        
        html += `
            <div class="order-item">
                <div>
                    <div class="item-name">${item.name}</div>
                    <div class="item-quantity">${quantity} x $${price.toLocaleString('es-AR')}</div>
                    <div class="cart-item-quantity-controls">
                        <button class="quantity-btn-small" onclick="updateCartQuantity('${item.id}', -1)">-</button>
                        <span class="quantity-display">${quantity}</span>
                        <button class="quantity-btn-small" onclick="updateCartQuantity('${item.id}', 1)">+</button>
                        <button class="quantity-btn-small" onclick="removeFromCheckoutCart('${item.id}')" style="margin-left: 10px; background: #ff4444; color: white; border-color: #ff4444;">🗑️</button>
                    </div>
                </div>
                <div class="item-price">$${itemTotal.toLocaleString('es-AR')}</div>
            </div>
        `;
    });
    
    orderItems.innerHTML = html;
    
    const shipping = subtotal >= 50000 ? 0 : 2500;
    const grandTotal = subtotal + shipping;
    
    subtotalEl.textContent = `$${subtotal.toLocaleString('es-AR')}`;
    shippingEl.textContent = shipping === 0 ? 'GRATIS' : `$${shipping.toLocaleString('es-AR')}`;
    shippingEl.style.color = shipping === 0 ? '#2c5530' : '#333';
    shippingEl.style.fontWeight = shipping === 0 ? 'bold' : 'normal';
    grandTotalEl.textContent = `$${grandTotal.toLocaleString('es-AR')}`;
}

// Actualizar cantidad en el carrito
function updateCartQuantity(productId, change) {
    const itemIndex = cart.findIndex(item => item.id === productId);
    if (itemIndex === -1) return;
    
    const newQuantity = cart[itemIndex].quantity + change;
    
    if (newQuantity < 1) {
        cart.splice(itemIndex, 1);
    } else {
        if (cart[itemIndex].maxStock && newQuantity > cart[itemIndex].maxStock) {
            showError(`Máximo disponible: ${cart[itemIndex].maxStock} unidades`);
            return;
        }
        cart[itemIndex].quantity = newQuantity;
    }
    
    localStorage.setItem('padelCart', JSON.stringify(cart));
    updateOrderSummary();
}

// Eliminar producto del carrito
function removeFromCheckoutCart(productId) {
    if (!confirm('¿Eliminar este producto del carrito?')) return;
    
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('padelCart', JSON.stringify(cart));
    updateOrderSummary();
    showError('Producto eliminado del carrito', 3000);
}

// ============================================
// FUNCIONES DE FORMULARIO
// ============================================

// Seleccionar método de pago
function selectPaymentMethod(method) {
    document.querySelectorAll('.payment-method').forEach(el => {
        el.classList.remove('selected');
    });
    
    const selected = document.querySelector(`input[value="${method}"]`);
    if (selected) {
        selected.parentElement.classList.add('selected');
        selected.checked = true;
    }
}

// Mostrar términos
function showTerms() {
    alert('TÉRMINOS Y CONDICIONES\n\n1. Todos los productos tienen 30 días de garantía.\n2. Los envíos se realizan en 3-5 días hábiles.\n3. Las devoluciones deben realizarse en el empaque original.\n4. Los precios incluyen IVA.\n5. El tiempo de entrega puede variar según la ubicación.');
}

// Mostrar política de privacidad
function showPrivacy() {
    alert('POLÍTICA DE PRIVACIDAD\n\n1. Tus datos personales solo se usarán para procesar tu pedido.\n2. No compartimos tu información con terceros.\n3. Puedes solicitar la eliminación de tus datos en cualquier momento.\n4. Tus datos de pago son procesados de forma segura.\n5. Cumplimos con las leyes de protección de datos.');
}

// ============================================
// FUNCIONES DE STOCK
// ============================================

// Función para proceder con stock bajo
function handleProceedWithLowStock() {
    proceedWithLowStockFlag = true;
    document.getElementById('stock-warning').classList.remove('show');
    submitOrder();
}

// Cancelar por stock bajo
function handleCancelLowStock() {
    proceedWithLowStockFlag = false;
    document.getElementById('stock-warning').classList.remove('show');
    showError('Por favor, ajusta las cantidades en tu carrito.');
}

// Mostrar advertencia de stock
function showStockWarning(outOfStockItems) {
    const warningEl = document.getElementById('stock-warning');
    const warningText = document.getElementById('stock-warning-text');
    
    let message = 'Los siguientes productos tienen stock insuficiente:\n\n';
    outOfStockItems.forEach(item => {
        message += `• ${item.name}: Pedido ${item.quantity}, Disponible ${item.availableStock}\n`;
    });
    
    warningText.textContent = message;
    warningEl.classList.add('show');
    warningEl.scrollIntoView({ behavior: 'smooth' });
}

// Verificar stock disponible
async function checkStockAvailability() {
    if (!db || cart.length === 0) {
        return { available: true, outOfStockItems: [] };
    }
    
    try {
        const outOfStockItems = [];
        
        for (const item of cart) {
            try {
                const productRef = db.collection('products').doc(item.id);
                const productDoc = await productRef.get();
                
                if (productDoc.exists) {
                    const productData = productDoc.data();
                    const currentStock = Number(productData.stock) || 0;
                    
                    if (currentStock < item.quantity) {
                        outOfStockItems.push({
                            ...item,
                            availableStock: currentStock,
                            needed: item.quantity - currentStock
                        });
                    }
                } else {
                    outOfStockItems.push({
                        ...item,
                        availableStock: 0,
                        needed: item.quantity,
                        error: 'Producto no encontrado'
                    });
                }
            } catch (error) {
                console.error(`Error verificando stock de ${item.name}:`, error);
            }
        }
        
        return {
            available: outOfStockItems.length === 0,
            outOfStockItems
        };
        
    } catch (error) {
        console.error('Error verificando stock:', error);
        return { 
            available: false, 
            outOfStockItems: [], 
            error: error.message 
        };
    }
}

// ============================================
// FUNCIONES DE PEDIDO
// ============================================

// Generar número de pedido único
function generateOrderId() {
    const prefix = 'PF-';
    const timestamp = Date.now().toString().slice(-6);
    const randomNum = Math.floor(Math.random() * 900) + 100;
    return prefix + timestamp + randomNum;
}

// Validar formulario
function validateForm() {
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();
    const city = document.getElementById('city').value.trim();
    const province = document.getElementById('province').value;
    const zipCode = document.getElementById('zipCode').value.trim();
    const country = document.getElementById('country').value;
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked');
    const acceptTerms = document.getElementById('acceptTerms').checked;
    
    if (!fullName) return 'Por favor, ingresa tu nombre completo';
    if (!email) return 'Por favor, ingresa tu email';
    if (!phone) return 'Por favor, ingresa tu teléfono';
    if (!address) return 'Por favor, ingresa tu dirección';
    if (!city) return 'Por favor, ingresa tu ciudad';
    if (!province) return 'Por favor, selecciona tu provincia';
    if (!zipCode) return 'Por favor, ingresa tu código postal';
    if (!country) return 'Por favor, selecciona tu país';
    if (!paymentMethod) return 'Por favor, selecciona un método de pago';
    if (!acceptTerms) return 'Debes aceptar los términos y condiciones';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return 'Por favor, ingresa un email válido';
    }
    
    return null;
}

// Enviar pedido
async function submitOrder() {
    if (isProcessingOrder) {
        showError('Ya se está procesando tu pedido');
        return;
    }
    
    if (!cart || cart.length === 0) {
        showError('Tu carrito está vacío');
        return;
    }
    
    const formError = validateForm();
    if (formError) {
        showError(formError);
        return;
    }
    
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();
    const city = document.getElementById('city').value.trim();
    const province = document.getElementById('province').value;
    const zipCode = document.getElementById('zipCode').value.trim();
    const country = document.getElementById('country').value;
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    const notes = document.getElementById('notes').value.trim();
    
    let subtotal = 0;
    cart.forEach(item => {
        subtotal += (item.price || 0) * (item.quantity || 1);
    });
    
    const shipping = subtotal >= 50000 ? 0 : 2500;
    const total = subtotal + shipping;
    
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span>Verificando stock...</span><div class="loading-spinner"></div>';
    submitBtn.disabled = true;
    isProcessingOrder = true;
    
    try {
        if (!proceedWithLowStockFlag && db) {
            const stockCheck = await checkStockAvailability();
            
            if (!stockCheck.available) {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                isProcessingOrder = false;
                showStockWarning(stockCheck.outOfStockItems);
                return;
            }
        }
        
        submitBtn.innerHTML = '<span>Procesando pedido...</span><div class="loading-spinner"></div>';
        
        const order = {
            id: generateOrderId(),
            customer: {
                fullName,
                email,
                phone,
                address,
                city,
                province,
                zipCode,
                country
            },
            items: cart.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                subtotal: item.price * item.quantity
            })),
            totals: {
                subtotal,
                shipping,
                total
            },
            paymentMethod,
            paymentStatus: 'pending',
            orderStatus: 'pending',
            notes: notes || '',
            date: new Date().toISOString(),
            source: 'web'
        };
        
        console.log('📦 Creando orden:', order);
        
        let saveResult;
        if (db) {
            try {
                order.createdAt = firebase.firestore.FieldValue.serverTimestamp();
                order.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
                
                const docRef = await db.collection('orders').add(order);
                saveResult = {
                    success: true,
                    orderId: order.id,
                    firestoreId: docRef.id
                };
            } catch (firestoreError) {
                console.error('Error en Firestore:', firestoreError);
                saveResult = saveOrderToLocalStorage(order);
            }
        } else {
            saveResult = saveOrderToLocalStorage(order);
        }
        
        if (saveResult && saveResult.success) {
            localStorage.removeItem('padelCart');
            cart = [];
            
            document.getElementById('orderId').textContent = order.id;
            document.getElementById('successModal').style.display = 'flex';
            
            console.log('🎉 Orden creada exitosamente:', order);
            
        } else {
            throw new Error(saveResult?.error || 'Error guardando la orden');
        }
        
    } catch (error) {
        console.error('❌ Error en submitOrder:', error);
        showError(`Error procesando el pedido: ${error.message}. Por favor, intenta nuevamente.`);
        
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        isProcessingOrder = false;
        return;
    }
}

// Guardar orden en localStorage (fallback)
function saveOrderToLocalStorage(order) {
    try {
        const orders = JSON.parse(localStorage.getItem('padelOrders') || '[]');
        orders.push(order);
        localStorage.setItem('padelOrders', JSON.stringify(orders));
        return { success: true };
    } catch (error) {
        console.error('Error guardando en localStorage:', error);
        return { success: false, error: error.message };
    }
}

// ============================================
// INICIALIZACIÓN
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Inicializando checkout...');
    
    initFirebaseCheckout();
    validateAndRepairCart();
    updateOrderSummary();
    
    document.addEventListener('firebaseReady', () => {
        db = window.db;
        console.log('✅ Firebase listo desde evento');
    });
    
    if (cart.length === 0) {
        console.log('🛒 Carrito vacío al cargar la página');
        showError('Tu carrito está vacío. Serás redirigido a la tienda en 5 segundos.', 5000);
        setTimeout(() => {
            window.location.href = '/';
        }, 5000);
    }
});

// ============================================
// EXPORTAR FUNCIONES GLOBALES
// ============================================

window.updateCartQuantity = updateCartQuantity;
window.removeFromCheckoutCart = removeFromCheckoutCart;
window.selectPaymentMethod = selectPaymentMethod;
window.showTerms = showTerms;
window.showPrivacy = showPrivacy;
window.handleProceedWithLowStock = handleProceedWithLowStock;
window.handleCancelLowStock = handleCancelLowStock;
window.submitOrder = submitOrder;