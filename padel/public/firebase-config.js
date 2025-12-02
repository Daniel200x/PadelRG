// firebase-config.js - VERSIÓN CORREGIDA Y SIMPLIFICADA
console.log("🔄 Configuración de Firebase - Pádel Fuego");

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB8hWvmisya70XCG59ShP1HxwXzpS6c8m8",
  authDomain: "padelfuego.firebaseapp.com",
  projectId: "padelfuego",
  storageBucket: "padelfuego.firebasestorage.app",
  messagingSenderId: "926116172976",
  appId: "1:926116172976:web:652fb988edad88e4ec1775",
  measurementId: "G-BGH0L0C6SV"
};

// Función principal para inicializar Firebase
function initFirebaseApp() {
    console.log('🔥 Intentando inicializar Firebase...');
    
    try {
        // Verificar si Firebase SDK está cargado
        if (typeof firebase === 'undefined') {
            console.warn('⚠️ Firebase SDK no disponible aún');
            return null;
        }
        
        console.log('✅ Firebase SDK detectado');
        
        // Inicializar la app solo si no está inicializada
        let app;
        if (!firebase.apps.length) {
            app = firebase.initializeApp(firebaseConfig);
            console.log('✅ Firebase App inicializada por primera vez');
        } else {
            app = firebase.apps[0];
            console.log('✅ Firebase App ya estaba inicializada');
        }
        
        // Configurar Firestore
        window.db = firebase.firestore(app);
        
        console.log('✅ Firebase configurado exitosamente');
        
        // Disparar evento para notificar a otras partes de la app
        document.dispatchEvent(new CustomEvent('firebaseReady'));
        
        return window.db;
        
    } catch (error) {
        console.error('❌ Error crítico inicializando Firebase:', error);
        return null;
    }
}

// Inicializar automáticamente cuando sea posible
function setupFirebase() {
    // Si Firebase ya está cargado, inicializar inmediatamente
    if (typeof firebase !== 'undefined') {
        console.log('🚀 Firebase SDK ya cargado, inicializando...');
        setTimeout(initFirebaseApp, 100);
    } else {
        // Si no está cargado, esperar
        console.log('⏳ Esperando carga de Firebase SDK...');
        
        // Crear un observador para detectar cuando se cargue Firebase
        const checkInterval = setInterval(() => {
            if (typeof firebase !== 'undefined') {
                clearInterval(checkInterval);
                initFirebaseApp();
            }
        }, 100);
        
        // Timeout de seguridad
        setTimeout(() => {
            clearInterval(checkInterval);
            if (!window.db) {
                console.warn('⚠️ Timeout: Firebase no se cargó en 5 segundos');
            }
        }, 5000);
    }
}

// Iniciar configuración cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupFirebase);
} else {
    setupFirebase();
}

// Hacer funciones disponibles globalmente
window.initFirebase = initFirebaseApp;
window.firebaseConfig = firebaseConfig;

// Exportar para módulos (si se usa)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { firebaseConfig, initFirebaseApp };
}