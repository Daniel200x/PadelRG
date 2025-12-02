// firebase-config.js
// Configuración de Firebase para Pádel Fuego
// VERSIÓN CORREGIDA - Segura y confiable

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB8hWvmisya70XCG59ShP1HxwXzpS6c8m8",
  authDomain: "padelfuego.firebaseapp.com",
  projectId: "padelfuego",
  storageBucket: "padelfuego.firebasestorage.app",
  messagingSenderId: "926116172976",
  appId: "1:926116172976:web:652fb988edad88e4ec1775",
  measurementId: "G-BGH0L0C6SV"
};

// Inicializar Firebase de forma segura
function initializeFirebase() {
    try {
        // Verificar si firebase está disponible
        if (typeof firebase === 'undefined') {
            console.warn("⚠️ Firebase SDK no está cargado aún");
            return null;
        }
        
        // Inicializar la app solo una vez
        let app;
        if (!firebase.apps.length) {
            app = firebase.initializeApp(firebaseConfig);
            console.log("✅ Firebase App inicializada");
        } else {
            app = firebase.apps[0];
            console.log("✅ Firebase App ya estaba inicializada");
        }
        
        // Obtener Firestore
        const db = firebase.firestore(app);
        console.log("✅ Firestore obtenido");
        
        return db;
        
    } catch (error) {
        console.error("❌ Error en initializeFirebase:", error);
        return null;
    }
}

// Función principal que se ejecuta cuando la página carga
function setupFirebase() {
    console.log("🔄 Configurando Firebase...");
    
    // Esperar a que firebase se cargue
    const checkFirebase = setInterval(() => {
        if (typeof firebase !== 'undefined') {
            clearInterval(checkFirebase);
            
            // Inicializar
            const db = initializeFirebase();
            
            if (db) {
                // Asignar a variable global
                window.db = db;
                console.log("✅ Firebase configurado exitosamente");
                
                // Disparar evento para notificar que Firebase está listo
                const event = new CustomEvent('firebaseReady', { 
                    detail: { db: db } 
                });
                document.dispatchEvent(event);
                
            } else {
                console.error("❌ No se pudo inicializar Firebase");
                window.db = null;
            }
        } else {
            console.log("⏳ Esperando carga de Firebase SDK...");
        }
    }, 100); // Verificar cada 100ms
    
    // Timeout después de 10 segundos
    setTimeout(() => {
        clearInterval(checkFirebase);
        if (!window.db) {
            console.warn("⚠️ Timeout: Firebase no se cargó en 10 segundos");
            window.db = null;
        }
    }, 10000);
}

// Iniciar configuración cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupFirebase);
} else {
    setupFirebase();
}

// También hacer la configuración disponible globalmente
window.firebaseConfig = firebaseConfig;
window.initializeFirebase = initializeFirebase;

// Exportar para módulos (si se usa)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { firebaseConfig, initializeFirebase };
}