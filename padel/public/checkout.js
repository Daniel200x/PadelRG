// ============================================
// CHECKOUT.JS - VERSIÓN CORREGIDA
// ============================================

// Variables globales
let cart = [];
let db = null;
let isProcessingOrder = false;
let proceedWithLowStockFlag = false;
let currentPaymentMethod = null;

// ============================================
// FUNCIONES DE DESCUENTOS - CON VERIFICACIÓN SEGURA
// ============================================

function calculateDiscounts(paymentMethod, subtotal) {
    const discountRates = {
        'transferencia': 0.10, // 10% de descuento
        'efectivo': 0.15,      // 15% de descuento
        'mercado-pago': 0      // 0% de descuento
    };
    
    const discountRate = discountRates[paymentMethod] || 0;
    const discountAmount = Math.round(subtotal * discountRate);
    const discountedSubtotal = subtotal - discountAmount;
    
    return {
        discountRate,
        discountAmount,
        discountedSubtotal,
        hasDiscount: discountRate > 0,
        discountPercentage: Math.round(discountRate * 100)
    };
}

function updatePaymentMethodUI(method) {
    currentPaymentMethod = method;
    updateOrderSummary();
}

// ============================================
// FUNCIONES DE UTILIDAD SEGURAS
// ============================================

// Función segura para obtener elementos
function getElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.warn(`⚠️ Elemento no encontrado: #${id}`);
    }
    return element;
}

// Función segura para establecer texto
function setText(elementId, text) {
    const element = getElement(elementId);
    if (element) {
        element.textContent = text;
    }
}

// Función segura para mostrar/ocultar elementos
function setDisplay(elementId, display) {
    const element = getElement(elementId);
    if (element) {
        element.style.display = display;
    }
}

// Función segura para establecer estilo
function setStyle(elementId, property, value) {
    const element = getElement(elementId);
    if (element) {
        element.style[property] = value;
    }
}

// ============================================
// FUNCIONES DE INICIALIZACIÓN
// ============================================

function initFirebaseCheckout() {
    console.log('🔥 Inicializando Firebase...');
    
    if (typeof firebase !== 'undefined' && window.initFirebase) {
        if (!window.db) {
            window.initFirebase();
        }
        db = window.db;
        console.log('✅ Firebase listo:', !!db);
    } else {
        console.warn('⚠️ Firebase no disponible');
    }
}

function validateAndRepairCart() {
    console.log('🔍 Validando carrito...');
    
    try {
        const cartData = localStorage.getItem('padelCart');
        
        if (!cartData || cartData === 'undefined' || cartData === 'null') {
            console.warn('❌ Carrito no encontrado');
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

function showError(message, duration = 5000) {
    const errorEl = getElement('error-message');
    if (!errorEl) return;
    
    errorEl.textContent = message;
    errorEl.classList.add('show');
    
    setTimeout(() => {
        errorEl.classList.remove('show');
    }, duration);
}

function toggleEmptyCartMessage(show) {
    setDisplay('empty-cart-message', show ? 'block' : 'none');
    setDisplay('order-items', show ? 'none' : 'block');
    const orderTotal = document.querySelector('.order-total');
    if (orderTotal) {
        orderTotal.style.display = show ? 'none' : 'block';
    }
}

// ============================================
// FUNCIONES DE CALCULO Y DISPLAY - CORREGIDAS
// ============================================

function updateOrderSummary() {
    console.log('📊 Actualizando resumen del pedido...');
    
    const orderItems = getElement('order-items');
    if (!orderItems) {
        console.error('❌ No se encontró #order-items');
        return;
    }
    
    if (!cart || cart.length === 0) {
        console.log('🛒 Carrito vacío');
        orderItems.innerHTML = '';
        setText('subtotal', '$0');
        setText('shipping', '$0');
        setText('grand-total', '$0');
        setDisplay('discount-row', 'none');
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
    
    // Calcular descuento si hay método de pago seleccionado
    let discount = 0;
    let finalSubtotal = subtotal;
    let discountPercentage = 0;
    
    if (currentPaymentMethod) {
        const discountInfo = calculateDiscounts(currentPaymentMethod, subtotal);
        discount = discountInfo.discountAmount;
        finalSubtotal = discountInfo.discountedSubtotal;
        discountPercentage = discountInfo.discountPercentage;
        
        // Mostrar descuento
        if (discount > 0) {
            setText('discount-label', `Descuento (${discountPercentage}%):`);
            setText('discount-amount', `-$${discount.toLocaleString('es-AR')}`);
            setDisplay('discount-row', 'flex');
            setStyle('discount-amount', 'color', '#dc3545');
            setStyle('discount-amount', 'fontWeight', 'bold');
        } else {
            setDisplay('discount-row', 'none');
        }
    } else {
        setDisplay('discount-row', 'none');
    }
    
    const shipping = finalSubtotal >= 30000 ? 0 : 2500;
    const grandTotal = finalSubtotal + shipping;
    
    setText('subtotal', `$${subtotal.toLocaleString('es-AR')}`);
    
    if (shipping === 0) {
        setText('shipping', 'GRATIS');
        setStyle('shipping', 'color', '#2c5530');
        setStyle('shipping', 'fontWeight', 'bold');
    } else {
        setText('shipping', `$${shipping.toLocaleString('es-AR')}`);
        setStyle('shipping', 'color', '#333');
        setStyle('shipping', 'fontWeight', 'normal');
    }
    
    setText('grand-total', `$${grandTotal.toLocaleString('es-AR')}`);
    
    // Mostrar información de descuento si aplica
    if (discount > 0) {
        console.log(`🎁 Descuento aplicado: $${discount.toLocaleString('es-AR')} (${discountPercentage}%)`);
    }
}

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

function selectPaymentMethod(method) {
    document.querySelectorAll('.payment-method').forEach(el => {
        el.classList.remove('selected');
    });
    
    const selected = document.querySelector(`input[value="${method}"]`);
    if (selected) {
        selected.parentElement.classList.add('selected');
        selected.checked = true;
        updatePaymentMethodUI(method);
    }
}

function showTerms() {
    alert('TÉRMINOS Y CONDICIONES\n\n1. Todos los productos tienen 30 días de garantía.\n2. Los envíos se realizan en 3-5 días hábiles.\n3. Las devoluciones deben realizarse en el empaque original.\n4. Los precios incluyen IVA.\n5. Descuentos: Transferencia 10%, Efectivo 15%.\n6. El tiempo de entrega puede variar según la ubicación.');
}

function showPrivacy() {
    alert('POLÍTICA DE PRIVACIDAD\n\n1. Tus datos personales solo se usarán para procesar tu pedido.\n2. No compartimos tu información con terceros.\n3. Puedes solicitar la eliminación de tus datos en cualquier momento.\n4. Tus datos de pago son procesados de forma segura.\n5. Cumplimos con las leyes de protección de datos.');
}

// ============================================
// FUNCIONES DE STOCK Y ORDEN
// ============================================

function handleProceedWithLowStock() {
    proceedWithLowStockFlag = true;
    const warningEl = getElement('stock-warning');
    if (warningEl) warningEl.classList.remove('show');
    submitOrder();
}

function handleCancelLowStock() {
    proceedWithLowStockFlag = false;
    const warningEl = getElement('stock-warning');
    if (warningEl) warningEl.classList.remove('show');
    showError('Por favor, ajusta las cantidades en tu carrito.');
}

function showStockWarning(outOfStockItems) {
    const warningEl = getElement('stock-warning');
    const warningText = getElement('stock-warning-text');
    
    if (!warningEl || !warningText) return;
    
    let message = 'Los siguientes productos tienen stock insuficiente:\n\n';
    outOfStockItems.forEach(item => {
        message += `• ${item.name}: Pedido ${item.quantity}, Disponible ${item.availableStock}\n`;
    });
    
    warningText.textContent = message;
    warningEl.classList.add('show');
    warningEl.scrollIntoView({ behavior: 'smooth' });
}

async function checkStockAvailability() {
    if (!db || cart.length === 0) {
        return { available: true, outOfStockItems: [] };
    }
    
    try {
        const outOfStockItems = [];
        const productPromises = [];
        
        for (const item of cart) {
            const productRef = db.collection('products').doc(item.id);
            productPromises.push(productRef.get());
        }
        
        const productDocs = await Promise.all(productPromises);
        
        productDocs.forEach((productDoc, index) => {
            const item = cart[index];
            
            if (productDoc.exists) {
                const productData = productDoc.data();
                const currentStock = Number(productData.stock) || 0;
                const quantity = Number(item.quantity) || 1;
                
                console.log(`📦 Verificando: ${item.name} - Stock actual: ${currentStock}, Pedido: ${quantity}`);
                
                if (currentStock < quantity) {
                    outOfStockItems.push({
                        ...item,
                        availableStock: currentStock,
                        needed: quantity - currentStock
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
        });
        
        console.log(`📊 Verificación de stock completada: ${outOfStockItems.length} productos con stock insuficiente`);
        
        return {
            available: outOfStockItems.length === 0,
            outOfStockItems
        };
        
    } catch (error) {
        console.error('❌ Error verificando stock:', error);
        return { 
            available: false, 
            outOfStockItems: [], 
            error: error.message 
        };
    }
}

async function updateProductStockAfterOrder(order) {
    console.log('🔄 Actualizando stock...');
    
    if (!db) {
        console.warn('⚠️ Firebase no disponible');
        return { success: false, error: 'Firebase no disponible' };
    }
    
    try {
        const batch = db.batch();
        
        for (const item of order.items) {
            const productRef = db.collection('products').doc(item.id);
            batch.update(productRef, {
                stock: firebase.firestore.FieldValue.increment(-item.quantity),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
        
        await batch.commit();
        console.log('✅ Stock actualizado exitosamente');
        
        return { success: true, message: 'Stock actualizado' };
        
    } catch (error) {
        console.error('❌ Error actualizando stock:', error);
        return { success: false, error: error.message };
    }
}

function generateOrderId() {
    const prefix = 'PF-';
    const timestamp = Date.now().toString().slice(-8);
    const randomNum = Math.floor(Math.random() * 9000) + 1000;
    return prefix + timestamp + randomNum;
}

function validateForm() {
    const fullName = getElement('fullName')?.value.trim();
    const email = getElement('email')?.value.trim();
    const phone = getElement('phone')?.value.trim();
    const address = getElement('address')?.value.trim();
    const city = getElement('city')?.value.trim();
    const province = getElement('province')?.value;
    const zipCode = getElement('zipCode')?.value.trim();
    const country = getElement('country')?.value;
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked');
    const acceptTerms = getElement('acceptTerms')?.checked;
    
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

function saveOrderToLocalStorage(order) {
    try {
        const orders = JSON.parse(localStorage.getItem('padelOrders') || '[]');
        orders.push(order);
        localStorage.setItem('padelOrders', JSON.stringify(orders));
        
        console.log('💾 Orden guardada localmente:', order.id);
        
        return { 
            success: true, 
            orderId: order.id
        };
    } catch (error) {
        console.error('Error guardando en localStorage:', error);
        return { success: false, error: error.message };
    }
}

// ============================================
// FUNCIÓN PRINCIPAL DE ENVÍO DE ORDEN
// ============================================

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
    
    // Obtener datos del formulario
    const fullName = getElement('fullName')?.value.trim() || '';
    const email = getElement('email')?.value.trim() || '';
    const phone = getElement('phone')?.value.trim() || '';
    const address = getElement('address')?.value.trim() || '';
    const city = getElement('city')?.value.trim() || '';
    const province = getElement('province')?.value || '';
    const zipCode = getElement('zipCode')?.value.trim() || '';
    const country = getElement('country')?.value || '';
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || '';
    const notes = getElement('notes')?.value.trim() || '';
    
    // Calcular totales CON DESCUENTOS
    let subtotal = 0;
    cart.forEach(item => {
        subtotal += (Number(item.price) || 0) * (Number(item.quantity) || 1);
    });
    
    // Aplicar descuento según método de pago
    const discountInfo = calculateDiscounts(paymentMethod, subtotal);
    const finalSubtotal = discountInfo.discountedSubtotal;
    const discountAmount = discountInfo.discountAmount;
    
    const shipping = finalSubtotal >= 30000 ? 0 : 2500;
    const total = finalSubtotal + shipping;
    
    // Actualizar UI del botón
    const submitBtn = getElement('submitBtn');
    if (!submitBtn) {
        showError('Error interno: no se encontró el botón de envío');
        return;
    }
    
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span>Procesando...</span><div class="loading-spinner"></div>';
    submitBtn.disabled = true;
    isProcessingOrder = true;
    
    try {
        // 1. VERIFICAR STOCK
        if (!proceedWithLowStockFlag && db) {
            submitBtn.innerHTML = '<span>Verificando stock...</span><div class="loading-spinner"></div>';
            const stockCheck = await checkStockAvailability();
            
            if (!stockCheck.available) {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                isProcessingOrder = false;
                showStockWarning(stockCheck.outOfStockItems);
                return;
            }
        }
        
        // 2. CREAR OBJETO DE ORDEN CON DESCUENTO
        submitBtn.innerHTML = '<span>Creando orden...</span><div class="loading-spinner"></div>';
        
        const orderId = generateOrderId();
        const order = {
            id: orderId,
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
                price: Number(item.price) || 0,
                quantity: Number(item.quantity) || 1,
                subtotal: (Number(item.price) || 0) * (Number(item.quantity) || 1)
            })),
            totals: {
                subtotal,
                discount: discountAmount,
                discountedSubtotal: finalSubtotal,
                shipping,
                total
            },
            paymentMethod,
            paymentStatus: 'pending',
            orderStatus: 'processing',
            notes: notes || '',
            date: new Date().toISOString(),
            source: 'web',
            discountApplied: discountInfo.hasDiscount,
            discountPercentage: discountInfo.discountPercentage,
            discountAmount: discountAmount
        };
        
        console.log('📦 Creando orden con descuento:', order);
        
        // 3. GUARDAR EN FIRESTORE
        let saveResult;
        if (db) {
            try {
                submitBtn.innerHTML = '<span>Guardando orden...</span><div class="loading-spinner"></div>';
                
                // Guardar orden
                const docRef = await db.collection('orders').add(order);
                console.log('✅ Orden guardada en Firestore:', docRef.id);
                
                // 4. ACTUALIZAR STOCK
                submitBtn.innerHTML = '<span>Actualizando stock...</span><div class="loading-spinner"></div>';
                
                const stockUpdateResult = await updateProductStockAfterOrder(order);
                console.log('📊 Resultado stock:', stockUpdateResult);
                
                // Actualizar orden con estado final
                await docRef.update({
                    orderStatus: 'completed',
                    stockUpdated: stockUpdateResult.success,
                    stockUpdateTime: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });
                
                saveResult = {
                    success: true,
                    orderId: order.id,
                    firestoreId: docRef.id,
                    stockUpdated: stockUpdateResult.success
                };
                
            } catch (firestoreError) {
                console.error('❌ Error en Firestore:', firestoreError);
                saveResult = saveOrderToLocalStorage(order);
            }
        } else {
            saveResult = saveOrderToLocalStorage(order);
        }
        
        // 5. PROCESAR RESULTADO
        if (saveResult && saveResult.success) {
            // Limpiar carrito
            localStorage.removeItem('padelCart');
            cart = [];
            
            // Mostrar modal de éxito CON INFO DE DESCUENTO
            setText('orderId', order.id);
            const successModal = getElement('successModal');
            if (successModal) successModal.style.display = 'flex';
            
            // Mostrar mensaje de descuento si aplicó
            if (discountAmount > 0) {
                console.log(`🎁 Descuento aplicado: $${discountAmount.toLocaleString('es-AR')} (${discountInfo.discountPercentage}%)`);
            }
            
            console.log('🎉 Orden completada exitosamente');
            
        } else {
            throw new Error(saveResult?.error || 'Error guardando la orden');
        }
        
    } catch (error) {
        console.error('❌ Error en submitOrder:', error);
        showError(`Error: ${error.message}`);
        
        if (submitBtn) {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
        isProcessingOrder = false;
        return;
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
        console.log('🛒 Carrito vacío');
        showError('Tu carrito está vacío. Serás redirigido a la tienda en 5 segundos.', 5000);
        setTimeout(() => {
            window.location.href = '/';
        }, 5000);
    }
    
    // Configurar evento para mostrar descuentos
    document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
        radio.addEventListener('change', function() {
            updatePaymentMethodUI(this.value);
        });
    });
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