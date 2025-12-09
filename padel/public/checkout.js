// ============================================
// CHECKOUT.JS - VERSIÓN COMPLETA CON EMAILJS SMTP
// ============================================

// Variables globales
let cart = [];
let db = null;
let isProcessingOrder = false;
let proceedWithLowStockFlag = false;
let currentPaymentMethod = null;

// ============================================
// CONFIGURACIÓN DE EMAILJS - REEMPLAZAR CON TUS DATOS
// ============================================

const EMAILJS_CONFIG = {
    SERVICE_ID: 'service_ceeunnn',
    TEMPLATE_ID: 'template_9zmuzwm',
    PUBLIC_KEY: '8LwZh9-rUS5JCaKsP'
};

// ============================================
// FUNCIONES DE MODAL - AÑADIDAS
// ============================================

function showSuccessModal(orderData) {
    console.log('🎉 Mostrando modal de éxito con datos:', orderData);
    
    const modal = getElement('successModal');
    const successContent = modal.querySelector('.success-content');
    
    if (!modal || !successContent) {
        console.error('❌ No se encontró el modal de éxito');
        // Fallback: mostrar alerta
        alert(`¡Pedido confirmado!\nNúmero: ${orderData.orderId}\nTotal: $${orderData.totals.total.toLocaleString('es-AR')}`);
        window.location.href = '/';
        return;
    }
    
    // Crear contenido HTML del modal
    const html = `
        <div class="success-icon">✅</div>
        <h2>¡Pedido Confirmado!</h2>
        <p>Tu pedido ha sido procesado exitosamente.</p>
        
        <div class="order-id-display">
            <strong>N° DE ORDEN:</strong>
            <div class="order-number">${orderData.orderId}</div>
        </div>
        
        <div class="customer-info">
            <p><strong>👤 Cliente:</strong> ${orderData.customerName}</p>
            <p><strong>📧 Email:</strong> ${orderData.customerEmail}</p>
            <p><strong>📱 Teléfono:</strong> ${orderData.customerPhone}</p>
            <p><strong>📍 Dirección:</strong> ${orderData.customerAddress}</p>
        </div>
        
        <div class="order-summary">
            <h4>📦 Resumen de tu pedido:</h4>
            <div class="order-items-container">
                ${orderData.items.map(item => `
                    <div class="order-item-summary">
                        <span class="item-name">${item.name}</span>
                        <span class="item-quantity">x${item.quantity}</span>
                        <span class="item-price">$${(item.price * item.quantity).toLocaleString('es-AR')}</span>
                    </div>
                `).join('')}
            </div>
            
            <div class="order-totals">
                <div class="total-line">
                    <span>Subtotal:</span>
                    <span>$${orderData.totals.subtotal.toLocaleString('es-AR')}</span>
                </div>
                ${orderData.discountAmount > 0 ? `
                <div class="total-line discount">
                    <span>Descuento (${orderData.discountPercentage}%):</span>
                    <span>-$${orderData.discountAmount.toLocaleString('es-AR')}</span>
                </div>
                ` : ''}
                <div class="total-line shipping">
                    <span>Envío:</span>
                    <span>${orderData.totals.shipping === 0 ? 'GRATIS' : `$${orderData.totals.shipping.toLocaleString('es-AR')}`}</span>
                </div>
                <div class="total-line grand-total">
                    <span><strong>TOTAL:</strong></span>
                    <span><strong>$${orderData.totals.total.toLocaleString('es-AR')}</strong></span>
                </div>
            </div>
        </div>
        
        <div class="payment-instructions">
            <h4>📋 Instrucciones de Pago:</h4>
            <p>Método seleccionado: <strong>${orderData.paymentMethod === 'transferencia' ? 'Transferencia Bancaria' : 
                orderData.paymentMethod === 'efectivo' ? 'Efectivo' : 'Mercado Pago'}</strong></p>
            ${orderData.paymentMethod === 'transferencia' ? `
                <p>Envía el pago de <strong>$${orderData.totals.total.toLocaleString('es-AR')}</strong> a:</p>
                <p>Banco: Santander<br>CBU: 0070002520000001234567</p>
            ` : orderData.paymentMethod === 'efectivo' ? `
                <p>Paga <strong>$${orderData.totals.total.toLocaleString('es-AR')}</strong> en efectivo al recibir tu pedido.</p>
            ` : `
                <p>Te contactaremos para enviarte el link de pago de Mercado Pago.</p>
            `}
        </div>
        
        <div class="modal-buttons">
            <button class="btn-primary" onclick="continueShopping()">🛒 Seguir Comprando</button>
            <button class="btn-secondary" onclick="printOrder()">🖨️ Imprimir Comprobante</button>
            <button class="btn-success" onclick="copyOrderNumber('${orderData.orderId}')">📋 Copiar N° de Orden</button>
        </div>
    `;
    
    successContent.innerHTML = html;
    modal.style.display = 'block';
    
    // Añadir estilos CSS para el modal si no existen
    if (!document.getElementById('modal-styles')) {
        addModalStyles();
    }
}

function updateEmailStatusInModal(success, email) {
    const successContent = document.querySelector('.success-content');
    if (!successContent) return;
    
    const emailSection = successContent.querySelector('.email-status') || 
                        document.createElement('div');
    
    if (!emailSection.parentNode) {
        emailSection.className = 'email-status';
        successContent.insertBefore(emailSection, successContent.querySelector('.modal-buttons'));
    }
    
    if (success) {
        emailSection.innerHTML = `
            <div class="email-success">
                <p><strong>📧 Email de confirmación enviado a:</strong></p>
                <p class="email-address">${email}</p>
                <p class="email-note"><small>Revisa tu bandeja de entrada y carpeta de spam.</small></p>
            </div>
        `;
    } else {
        emailSection.innerHTML = `
            <div class="email-alternative">
                <p><strong>📧 Para mayor seguridad, te recomendamos:</strong></p>
                <ol>
                    <li>Guardar este número de orden</li>
                    <li>Contactarnos a: <strong>padelriogrande@gmail.com</strong></li>
                    <li>Mencionar tu número de orden en cualquier consulta</li>
                </ol>
            </div>
        `;
    }
}

function addModalStyles() {
    const style = document.createElement('style');
    style.id = 'modal-styles';
    style.textContent = `
        .modal {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            z-index: 10000;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .modal-content {
            background: white;
            border-radius: 15px;
            max-width: 600px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            animation: modalIn 0.5s ease;
        }
        
        @keyframes modalIn {
            from {
                opacity: 0;
                transform: translateY(-30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .success-content {
            padding: 40px;
        }
        
        .success-icon {
            font-size: 60px;
            color: #2c5530;
            margin-bottom: 20px;
        }
        
        .success-content h2 {
            color: #2c5530;
            margin-bottom: 15px;
        }
        
        .success-content p {
            color: #666;
            margin-bottom: 25px;
            line-height: 1.6;
        }
        
        .order-id-display {
            background: #f0f7f0;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            margin: 20px 0;
            border: 2px dashed #4CAF50;
        }
        
        .order-number {
            font-size: 1.8em;
            letter-spacing: 2px;
            font-weight: bold;
            color: #2c5530;
            margin-top: 10px;
        }
        
        .customer-info {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            border-left: 4px solid #3498db;
        }
        
        .customer-info p {
            margin: 8px 0;
            padding: 5px 0;
            border-bottom: 1px solid #eee;
        }
        
        .customer-info p:last-child {
            border-bottom: none;
        }
        
        .order-summary {
            background: white;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        
        .order-items-container {
            max-height: 200px;
            overflow-y: auto;
            margin-bottom: 20px;
        }
        
        .order-item-summary {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #eee;
        }
        
        .order-totals {
            border-top: 2px solid #dee2e6;
            padding-top: 15px;
            margin-top: 15px;
        }
        
        .total-line {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
        }
        
        .total-line.grand-total {
            font-size: 1.3em;
            font-weight: bold;
            color: #2c5530;
            border-top: 2px solid #2c5530;
            margin-top: 10px;
            padding-top: 15px;
        }
        
        .payment-instructions {
            background: #e7f3ff;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        
        .modal-buttons {
            display: flex;
            gap: 15px;
            margin-top: 30px;
            flex-wrap: wrap;
        }
        
        .modal-buttons button {
            flex: 1;
            min-width: 180px;
            padding: 12px 20px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.3s;
        }
        
        .btn-primary {
            background: #2c5530;
            color: white;
        }
        
        .btn-secondary {
            background: #6c757d;
            color: white;
        }
        
        .btn-success {
            background: #28a745;
            color: white;
        }
        
        @media (max-width: 768px) {
            .modal-content {
                margin: 10px;
            }
            
            .success-content {
                padding: 20px;
            }
            
            .modal-buttons {
                flex-direction: column;
            }
            
            .modal-buttons button {
                width: 100%;
            }
        }
    `;
    document.head.appendChild(style);
}

// ============================================
// FUNCIONES DE EMAIL CON EMAILJS SMTP
// ============================================

async function sendOrderConfirmationEmail(order) {
    try {
        console.log('📧 Preparando email de confirmación...');
        
        if (typeof emailjs === 'undefined') {
            console.warn('⚠️ EmailJS no está cargado');
            return { 
                success: false, 
                error: 'EmailJS no disponible',
                fallback: true 
            };
        }
        
        if (!EMAILJS_CONFIG.SERVICE_ID || !EMAILJS_CONFIG.TEMPLATE_ID || !EMAILJS_CONFIG.PUBLIC_KEY) {
            console.warn('⚠️ Configuración de EmailJS incompleta');
            return { 
                success: false, 
                error: 'Configuración incompleta',
                fallback: true 
            };
        }
        
        const paymentMethodNames = {
            'transferencia': 'Transferencia Bancaria (10% descuento)',
            'efectivo': 'Efectivo (15% descuento)',
            'mercado-pago': 'Mercado Pago'
        };
        
        // Generar tabla de productos
        let productsHtml = '';
        order.items.forEach(item => {
            const itemTotal = item.price * item.quantity;
            productsHtml += `
                <tr>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.name}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">$${itemTotal.toLocaleString('es-AR')}</td>
                </tr>
            `;
        });
        
        const fullProductsTable = `
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: white; border: 1px solid #ddd;">
                <thead>
                    <tr>
                        <th style="background: #2c5530; color: white; padding: 12px; text-align: left; font-weight: bold;">Producto</th>
                        <th style="background: #2c5530; color: white; padding: 12px; text-align: center; font-weight: bold;">Cantidad</th>
                        <th style="background: #2c5530; color: white; padding: 12px; text-align: right; font-weight: bold;">Precio</th>
                    </tr>
                </thead>
                <tbody>
                    ${productsHtml}
                </tbody>
            </table>
        `;
        
        // Generar tabla de totales
        const totalsTable = `
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr>
                    <td style="padding: 10px 0; border-bottom: 1px dashed #ddd;">Subtotal:</td>
                    <td style="padding: 10px 0; border-bottom: 1px dashed #ddd; text-align: right;">$${order.totals.subtotal.toLocaleString('es-AR')}</td>
                </tr>
                ${order.discountAmount > 0 ? `
                <tr>
                    <td style="padding: 10px 0; border-bottom: 1px dashed #ddd;">Descuento:</td>
                    <td style="padding: 10px 0; border-bottom: 1px dashed #ddd; text-align: right; color: #dc3545; font-weight: bold;">
                        -$${order.discountAmount.toLocaleString('es-AR')}
                    </td>
                </tr>
                ` : ''}
                <tr>
                    <td style="padding: 10px 0; border-bottom: 1px dashed #ddd;">Envío:</td>
                    <td style="padding: 10px 0; border-bottom: 1px dashed #ddd; text-align: right;">
                        ${order.totals.shipping === 0 ? 'GRATIS' : `$${order.totals.shipping.toLocaleString('es-AR')}`}
                    </td>
                </tr>
                <tr>
                    <td style="padding: 15px 0; border-top: 2px solid #2c5530; font-size: 18px; font-weight: bold; color: #2c5530;">TOTAL:</td>
                    <td style="padding: 15px 0; border-top: 2px solid #2c5530; text-align: right; font-size: 18px; font-weight: bold; color: #2c5530;">
                        $${order.totals.total.toLocaleString('es-AR')}
                    </td>
                </tr>
            </table>
        `;
        
        // **IMPORTANTE: Configurar parámetros para que el email llegue al cliente**
        const templateParams = {
            // ESTOS 4 CAMPOS SON CRÍTICOS para que el email llegue al cliente:
            to_email: order.customer.email,  // ✅ El email del cliente
            from_name: 'Pádel Fuego',        // ✅ Tu nombre/empresa
            reply_to: 'padelriogrande@gmail.com',  // ✅ Email para respuestas
            subject: `✅ Confirmación de Pedido #${order.id} - Pádel Fuego`,  // ✅ Asunto
            
            // Variables de contenido (estas ya las tienes):
            order_id: order.id,
            customer_name: order.customer.fullName,
            customer_email: order.customer.email,
            customer_phone: order.customer.phone || 'No proporcionado',
            customer_address: `${order.customer.address}, ${order.customer.city}, ${order.customer.province}`.trim(),
            order_date: new Date(order.date).toLocaleDateString('es-AR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }),
            products_table: fullProductsTable,
            totals_table: totalsTable,
            subtotal: `$${order.totals.subtotal.toLocaleString('es-AR')}`,
            discount: order.discountAmount > 0 ? `-$${order.discountAmount.toLocaleString('es-AR')}` : 'No aplica',
            shipping: order.totals.shipping === 0 ? 'GRATIS' : `$${order.totals.shipping.toLocaleString('es-AR')}`,
            total: `$${order.totals.total.toLocaleString('es-AR')}`,
            payment_method: paymentMethodNames[order.paymentMethod] || order.paymentMethod,
            payment_instructions: getPaymentInstructions(order.paymentMethod, order.totals.total),
            special_notes: order.notes || 'No hay notas adicionales',
            website_url: 'https://padelfuego.web.app',
            contact_email: 'padelriogrande@gmail.com',
            contact_phone: '+54 9 11 1234-5678',
            current_year: new Date().getFullYear().toString()
        };
        
        console.log('📤 Enviando email a:', order.customer.email);
        console.log('📋 Configuración de envío:', {
            to: templateParams.to_email,
            from: templateParams.from_name,
            subject: templateParams.subject
        });
        
        const response = await emailjs.send(
            EMAILJS_CONFIG.SERVICE_ID,
            EMAILJS_CONFIG.TEMPLATE_ID,
            templateParams
        );
        
        console.log('✅ Email enviado exitosamente:', response.status);
        console.log('📧 Destinatario:', order.customer.email);
        
        return { 
            success: true, 
            message: 'Email de confirmación enviado',
            email: order.customer.email,
            response: response
        };
        
    } catch (error) {
        console.error('❌ Error enviando email:', error);
        console.error('❌ Detalles del error:', error.text || error.message);
        
        return { 
            success: false, 
            error: error.text || error.message || 'Error desconocido',
            fallback: true
        };
    }
}

// Función auxiliar para instrucciones de pago
function getPaymentInstructions(paymentMethod, total) {
    switch(paymentMethod) {
        case 'transferencia':
            return `Envía el pago de $${total.toLocaleString('es-AR')} a:<br>
                    Banco: Santander<br>
                    CBU: 0070002520000001234567<br>
                    Alias: PADEL.FUEGO`;
        case 'efectivo':
            return `Paga $${total.toLocaleString('es-AR')} en efectivo al recibir tu pedido.<br>
                    Ten el monto exacto preparado.`;
        case 'mercado-pago':
            return `Te enviaremos un link de pago de Mercado Pago en las próximas horas.<br>
                    Total a pagar: $${total.toLocaleString('es-AR')}`;
        default:
            return 'Te contactaremos para coordinar el pago.';
    }
}

// ============================================
// FUNCIONES DE DESCUENTOS
// ============================================

function calculateDiscounts(paymentMethod, subtotal) {
    const discountRates = {
        'transferencia': 0.10,
        'efectivo': 0.15,
        'mercado-pago': 0
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
// FUNCIONES DE UTILIDAD
// ============================================

function getElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.warn(`⚠️ Elemento no encontrado: #${id}`);
    }
    return element;
}

function setText(elementId, text) {
    const element = getElement(elementId);
    if (element) {
        element.textContent = text;
    }
}

function setDisplay(elementId, display) {
    const element = getElement(elementId);
    if (element) {
        element.style.display = display;
    }
}

function showToast(message, type = 'info', duration = 3000) {
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            max-width: 350px;
        `;
        document.body.appendChild(toastContainer);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.style.cssText = `
        background: ${type === 'success' ? '#d4edda' : 
                     type === 'error' ? '#f8d7da' : 
                     type === 'warning' ? '#fff3cd' : '#d1ecf1'};
        color: ${type === 'success' ? '#155724' : 
                type === 'error' ? '#721c24' : 
                type === 'warning' ? '#856404' : '#0c5460'};
        border: 1px solid ${type === 'success' ? '#c3e6cb' : 
                          type === 'error' ? '#f5c6cb' : 
                          type === 'warning' ? '#ffeaa7' : '#bee5eb'};
        border-left: 4px solid ${type === 'success' ? '#28a745' : 
                               type === 'error' ? '#dc3545' : 
                               type === 'warning' ? '#ffc107' : '#17a2b8'};
        padding: 12px 15px;
        margin-bottom: 10px;
        border-radius: 4px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        animation: slideIn 0.3s ease;
    `;
    
    toast.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" 
                    style="background: none; border: none; font-size: 20px; cursor: pointer; opacity: 0.7; padding: 0 0 0 10px;">
                &times;
            </button>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }
    }, duration);
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
    if (!errorEl) {
        showToast(message, 'error', duration);
        return;
    }
    
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
// FUNCIONES DE CALCULO Y DISPLAY
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
    
    let discount = 0;
    let finalSubtotal = subtotal;
    let discountPercentage = 0;
    
    if (currentPaymentMethod) {
        const discountInfo = calculateDiscounts(currentPaymentMethod, subtotal);
        discount = discountInfo.discountAmount;
        finalSubtotal = discountInfo.discountedSubtotal;
        discountPercentage = discountInfo.discountPercentage;
        
        if (discount > 0) {
            setText('discount-label', `Descuento (${discountPercentage}%):`);
            setText('discount-amount', `-$${discount.toLocaleString('es-AR')}`);
            setDisplay('discount-row', 'flex');
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
    } else {
        setText('shipping', `$${shipping.toLocaleString('es-AR')}`);
    }
    
    setText('grand-total', `$${grandTotal.toLocaleString('es-AR')}`);
}

function updateCartQuantity(productId, change) {
    const itemIndex = cart.findIndex(item => item.id === productId);
    if (itemIndex === -1) return;
    
    const newQuantity = cart[itemIndex].quantity + change;
    
    if (newQuantity < 1) {
        cart.splice(itemIndex, 1);
        showToast('Producto eliminado del carrito', 'success', 2000);
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
    showToast('Producto eliminado del carrito', 'success', 3000);
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
        showToast(`Método de pago: ${method} seleccionado`, 'success', 2000);
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
            
            console.log('✅ Orden procesada exitosamente');
            
            // Crear datos para el modal
            const modalData = {
                orderId: order.id,
                customerName: order.customer.fullName,
                customerEmail: order.customer.email,
                customerPhone: order.customer.phone,
                customerAddress: `${order.customer.address}, ${order.customer.city}, ${order.customer.province}`,
                items: order.items,
                totals: order.totals,
                paymentMethod: order.paymentMethod,
                discountAmount: order.discountAmount,
                discountPercentage: order.discountPercentage,
                date: new Date(order.date).toLocaleDateString('es-AR'),
                time: new Date(order.date).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
            };
            
            // Mostrar modal con los datos
            showSuccessModal(modalData);
            
            // 6. ENVIAR EMAIL DE CONFIRMACIÓN (EN SEGUNDO PLANO)
            console.log('📧 Intentando enviar email de confirmación...');
            
            setTimeout(async () => {
                try {
                    const emailResult = await sendOrderConfirmationEmail(order);
                    console.log('📧 Resultado del email:', emailResult);
                    
                    // Actualizar el modal con el estado del email
                    updateEmailStatusInModal(emailResult.success, order.customer.email);
                    
                } catch (emailError) {
                    console.warn('⚠️ Error en email:', emailError);
                    updateEmailStatusInModal(false, order.customer.email);
                }
            }, 1000);
            
        } else {
            throw new Error(saveResult?.error || 'Error guardando la orden');
        }
        
    } catch (error) {
        console.error('❌ Error en submitOrder:', error);
        showError(`Error: ${error.message}. Intenta nuevamente.`);
        
        if (submitBtn) {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
        isProcessingOrder = false;
        return;
    }
}


async function debugTemplateVariables() {
    console.log('🔍 Probando cada variable por separado...');
    
    const testCases = [
        { name: 'Test básico', params: { test: 'Hola' } },
        { name: 'order_id', params: { order_id: 'TEST-123' } },
        { name: 'items_list', params: { 
            items_list: '<table><tr><td>Producto</td><td>1</td><td>$100</td></tr></table>' 
        }},
        { name: 'Todas juntas', params: {
            order_id: 'TEST-123',
            customer_name: 'Juan',
            customer_email: 'test@test.com',
            customer_phone: '123',
            customer_address: 'Calle 123',
            items_list: '<table><tr><td>P1</td><td>1</td><td>$100</td></tr></table>',
            subtotal: '$100',
            discount: '-$10',
            shipping: 'GRATIS',
            total: '$90',
            payment_method: 'Transferencia',
            special_notes: 'Test',
            website_url: 'https://test.com',
            contact_email: 'test@test.com',
            contact_phone: '123',
            current_year: '2024'
        }}
    ];
    
    for (const testCase of testCases) {
        console.log(`\n🧪 ${testCase.name}:`);
        try {
            await emailjs.send(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATE_ID, testCase.params);
            console.log('✅ OK');
        } catch (error) {
            console.error('❌ ERROR:', error.text || error.message);
        }
    }
}



// ============================================
// FUNCIONES ADICIONALES
// ============================================

function closeSuccessModal() {
    const successModal = getElement('successModal');
    if (successModal) {
        successModal.style.display = 'none';
    }
}

function printOrder() {
    window.print();
}

function continueShopping() {
    window.location.href = '/';
}

function copyOrderNumber(orderId) {
    if (!orderId) {
        orderId = document.querySelector('.order-number')?.textContent;
    }
    
    if (!orderId) return;
    
    navigator.clipboard.writeText(orderId).then(() => {
        showToast('Número de orden copiado al portapapeles', 'success', 2000);
        
        const copyBtn = document.querySelector('.btn-success');
        if (copyBtn) {
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = '✅ ¡Copiado!';
            copyBtn.style.background = '#28a745';
            
            setTimeout(() => {
                copyBtn.innerHTML = originalText;
                copyBtn.style.background = '';
            }, 2000);
        }
    }).catch(err => {
        console.error('Error al copiar:', err);
        showToast('Error al copiar el número', 'error', 2000);
    });
}

function initEmailJS() {
    if (typeof emailjs !== 'undefined' && EMAILJS_CONFIG.PUBLIC_KEY) {
        try {
            emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
            console.log('✅ EmailJS inicializado correctamente');
            return true;
        } catch (error) {
            console.warn('⚠️ Error inicializando EmailJS:', error);
            return false;
        }
    } else {
        console.warn('⚠️ EmailJS no configurado o no cargado');
        return false;
    }
}

// ============================================
// INICIALIZACIÓN COMPLETA
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Inicializando checkout completo...');
    
    initFirebaseCheckout();
    validateAndRepairCart();
    updateOrderSummary();
    
    // Inicializar EmailJS
    initEmailJS();
    
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
window.closeSuccessModal = closeSuccessModal;
window.printOrder = printOrder;
window.continueShopping = continueShopping;
window.copyOrderNumber = copyOrderNumber;
window.showSuccessModal = showSuccessModal;
window.debugEmailJS = debugEmailJS;