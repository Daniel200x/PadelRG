// Datos de productos
const products = [
    {
        id: 1,
        name: "Pala Bullpadel Vertex",
        price: 89990,
        category: "palas",
        emoji: "🎾"
    },
    {
        id: 2,
        name: "Pala Head Alpha",
        price: 75990,
        category: "palas",
        emoji: "🔥"
    },
    {
        id: 3,
        name: "Pelotas Pádel Head",
        price: 12990,
        category: "bolas",
        emoji: "⚪"
    },
    {
        id: 4,
        name: "Overgrips Tecnifibre",
        price: 4990,
        category: "accesorios",
        emoji: "🎀"
    },
    {
        id: 5,
        name: "Mochila Pádel",
        price: 29990,
        category: "accesorios",
        emoji: "🎒"
    },
    {
        id: 6,
        name: "Zapatillas Pádel",
        price: 45990,
        category: "calzado",
        emoji: "👟"
    }
];

// Carrito de compras
let cart = [];

// Cargar productos al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    setupEventListeners();
});

// Cargar productos en la grid
function loadProducts() {
    const productsGrid = document.getElementById('products-grid');
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-image">
                ${product.emoji}
            </div>
            <h3>${product.name}</h3>
            <p>${product.category}</p>
            <div class="price">$${product.price.toLocaleString()}</div>
            <button class="add-to-cart" onclick="addToCart(${product.id})">
                Agregar al Carrito
            </button>
        `;
        productsGrid.appendChild(productCard);
    });
}

// Configurar event listeners
function setupEventListeners() {
    // Formulario de contacto
    const contactForm = document.getElementById('contact-form');
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        alert('¡Gracias por tu mensaje! Te contactaremos pronto.');
        contactForm.reset();
    });

    // Smooth scroll para navegación
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Funciones del carrito
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        cart.push(product);
        showNotification(`${product.name} agregado al carrito`);
        updateCartCounter();
    }
}

function showNotification(message) {
    // Crear notificación
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #2c5530;
        color: white;
        padding: 1rem;
        border-radius: 5px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    // Remover después de 3 segundos
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function updateCartCounter() {
    // Puedes implementar un contador de carrito en el navbar
    let cartCounter = document.getElementById('cart-counter');
    if (!cartCounter) {
        cartCounter = document.createElement('span');
        cartCounter.id = 'cart-counter';
        cartCounter.style.cssText = `
            background: #ff6b35;
            color: white;
            border-radius: 50%;
            padding: 2px 6px;
            font-size: 0.8rem;
            margin-left: 5px;
        `;
        const cartLink = document.querySelector('.nav-links li:last-child');
        if (cartLink) {
            cartLink.appendChild(cartCounter);
        }
    }
    cartCounter.textContent = cart.length;
}

function scrollToProducts() {
    document.getElementById('productos').scrollIntoView({
        behavior: 'smooth'
    });
}

// Función para mostrar el carrito (puedes expandir esta funcionalidad)
function showCart() {
    if (cart.length === 0) {
        alert('Tu carrito está vacío');
        return;
    }
    
    let cartContent = "Tu Carrito:\n\n";
    let total = 0;
    
    cart.forEach(item => {
        cartContent += `• ${item.name} - $${item.price.toLocaleString()}\n`;
        total += item.price;
    });
    
    cartContent += `\nTotal: $${total.toLocaleString()}`;
    alert(cartContent);
}