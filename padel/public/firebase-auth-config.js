// firebase-auth-config.js - VERSIÓN SIMPLIFICADA

const firebaseConfig = {
    apiKey: "AIzaSyB8hWvmisya70XCG59ShP1HxwXzpS6c8m8",
    authDomain: "padelfuego.firebaseapp.com",
    projectId: "padelfuego",
    storageBucket: "padelfuego.firebasestorage.app",
    messagingSenderId: "926116172976",
    appId: "1:926116172976:web:652fb988edad88e4ec1775",
    measurementId: "G-BGH0L0C6SV"
};

// Inicializar Firebase una sola vez
function initFirebase() {
    try {
        if (typeof firebase === 'undefined') {
            console.warn("⚠️ Firebase SDK no cargado");
            return false;
        }
        
        // Inicializar app
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
            console.log("✅ Firebase App inicializada");
        }
        
        // Inicializar servicios
        const db = firebase.firestore();
        const auth = firebase.auth();
        
        // Configurar proveedor de Google
        const googleProvider = new firebase.auth.GoogleAuthProvider();
        
        // Hacer disponibles globalmente
        window.db = db;
        window.auth = auth;
        window.googleProvider = googleProvider;
        
        console.log("✅ Firebase configurado correctamente");
        return true;
        
    } catch (error) {
        console.error("❌ Error inicializando Firebase:", error);
        return false;
    }
}

// Función de login con Google
async function loginWithGoogle() {
    try {
        if (!window.auth || !window.googleProvider) {
            throw new Error("Firebase no está configurado");
        }
        
        const result = await window.auth.signInWithPopup(window.googleProvider);
        
        if (result.user) {
            console.log("✅ Login exitoso:", result.user.email);
            return {
                success: true,
                user: result.user
            };
        } else {
            throw new Error("No se obtuvo usuario");
        }
        
    } catch (error) {
        console.error("❌ Error en login:", error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Función de logout
async function logout() {
    try {
        if (!window.auth) {
            throw new Error("Firebase no está configurado");
        }
        
        await window.auth.signOut();
        console.log("✅ Sesión cerrada");
        return { success: true };
        
    } catch (error) {
        console.error("❌ Error cerrando sesión:", error);
        return { success: false, error: error.message };
    }
}

// Obtener usuario actual
function getCurrentUser() {
    return window.auth ? window.auth.currentUser : null;
}

// Inicializar cuando el SDK esté listo
if (typeof firebase !== 'undefined') {
    initFirebase();
    
    // Escuchar cambios de autenticación
    if (window.auth) {
        window.auth.onAuthStateChanged((user) => {
            if (user) {
                console.log("👤 Usuario autenticado:", user.email);
                document.dispatchEvent(new CustomEvent('userAuthenticated', { detail: { user } }));
            } else {
                console.log("🚪 Usuario no autenticado");
                document.dispatchEvent(new CustomEvent('userLoggedOut'));
            }
        });
    }
    
    // Hacer funciones disponibles
    window.loginWithGoogle = loginWithGoogle;
    window.logout = logout;
    window.getCurrentUser = getCurrentUser;
    
    // Disparar evento cuando Firebase esté listo
    document.dispatchEvent(new CustomEvent('firebaseReady'));
}

// Exportar configuración
window.firebaseConfig = firebaseConfig;