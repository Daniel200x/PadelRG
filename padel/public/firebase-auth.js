// firebase-auth.js - VERSIÓN SIMPLIFICADA

const firebaseConfig = {
    apiKey: "AIzaSyB8hWvmisya70XCG59ShP1HxwXzpS6c8m8",
    authDomain: "padelfuego.firebaseapp.com",
    projectId: "padelfuego",
    storageBucket: "padelfuego.firebasestorage.app",
    messagingSenderId: "926116172976",
    appId: "1:926116172976:web:652fb988edad88e4ec1775",
    measurementId: "G-BGH0L0C6SV"
};

// Variables globales
let _db = null;
let _auth = null;
let _currentUser = null;
let _isAdmin = false;

// Lista de emails admin (hardcodeada temporalmente)
const ADMIN_EMAILS = [
    "padelriogrande@gmail.com",
    // Agrega más emails aquí
];

// Inicializar Firebase
function initFirebase() {
    try {
        if (typeof firebase === 'undefined') {
            console.warn('⚠️ Firebase SDK no cargado');
            return false;
        }

        // Inicializar app
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
            console.log('✅ Firebase App inicializada');
        }

        // Inicializar servicios
        _db = firebase.firestore();
        _auth = firebase.auth();
        
        console.log('✅ Firebase configurado');

        // Configurar escucha de autenticación
        _auth.onAuthStateChanged((user) => {
            _currentUser = user;
            
            if (user) {
                console.log('✅ Usuario autenticado:', user.email);
                _isAdmin = checkIfAdmin(user.email);
                
                if (_isAdmin) {
                    console.log('👑 Usuario es ADMIN');
                }
                
                document.dispatchEvent(new CustomEvent('authStateChanged', {
                    detail: { 
                        user: user, 
                        authenticated: true,
                        isAdmin: _isAdmin
                    }
                }));
                
            } else {
                console.log('❌ Usuario no autenticado');
                _isAdmin = false;
                document.dispatchEvent(new CustomEvent('authStateChanged', {
                    detail: { authenticated: false, isAdmin: false }
                }));
            }
        });

        return true;

    } catch (error) {
        console.error('❌ Error Firebase:', error);
        return false;
    }
}

// Verificar si el usuario es admin (versión simplificada)
function checkIfAdmin(email) {
    if (!email) return false;
    
    // Convertir email a minúsculas para comparación
    const normalizedEmail = email.toLowerCase().trim();
    
    // Verificar en lista hardcodeada
    const isAdmin = ADMIN_EMAILS.some(adminEmail => 
        adminEmail.toLowerCase().trim() === normalizedEmail
    );
    
    console.log(`🔍 Verificando admin: ${email} → ${isAdmin ? 'SI' : 'NO'}`);
    return isAdmin;
}

// Función de login
async function loginWithGoogle() {
    try {
        if (!_auth) {
            throw new Error('Auth no inicializado');
        }

        const provider = new firebase.auth.GoogleAuthProvider();
        const result = await _auth.signInWithPopup(provider);
        
        // Verificar si es admin
        const isAdmin = checkIfAdmin(result.user.email);
        
        return {
            success: true,
            user: result.user,
            isAdmin: isAdmin
        };

    } catch (error) {
        console.error('Error en login:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Función de logout
async function logout() {
    try {
        if (!_auth) {
            throw new Error('Auth no inicializado');
        }

        await _auth.signOut();
        _isAdmin = false;
        return { success: true };

    } catch (error) {
        console.error('Error en logout:', error);
        return { 
            success: false, 
            error: error.message 
        };
    }
}

// Obtener usuario actual
function getCurrentUser() {
    return _currentUser;
}

// Obtener Firestore
function getFirestore() {
    return _db;
}

// Verificar autenticación
function isAuthenticated() {
    return _currentUser !== null;
}

// Verificar si es admin
function isAdmin() {
    return _isAdmin;
}

// Obtener lista de emails admin
function getAdminEmails() {
    return [...ADMIN_EMAILS];
}

// Agregar email a lista admin (solo para desarrollo)
function addAdminEmail(email) {
    const normalizedEmail = email.toLowerCase().trim();
    
    if (!ADMIN_EMAILS.includes(normalizedEmail)) {
        ADMIN_EMAILS.push(normalizedEmail);
        console.log(`✅ Email agregado a lista admin: ${email}`);
        
        // Si el usuario actual tiene este email, actualizar estado
        if (_currentUser && _currentUser.email.toLowerCase().trim() === normalizedEmail) {
            _isAdmin = true;
            document.dispatchEvent(new CustomEvent('adminStatusChanged', {
                detail: { isAdmin: true }
            }));
        }
        
        return true;
    }
    
    return false;
}

// Inicializar cuando Firebase esté listo
if (typeof firebase !== 'undefined') {
    // Esperar un momento para que el SDK cargue completamente
    setTimeout(() => {
        initFirebase();
        
        // Hacer funciones disponibles globalmente
        window.db = _db;
        window.auth = _auth;
        window.loginWithGoogle = loginWithGoogle;
        window.logout = logout;
        window.getCurrentUser = getCurrentUser;
        window.getFirestore = getFirestore;
        window.isAuthenticated = isAuthenticated;
        window.isAdmin = isAdmin;
        window.getAdminEmails = getAdminEmails;
        window.addAdminEmail = addAdminEmail;
        window.initFirebase = initFirebase;
        
        console.log('✅ Firebase Auth configurado');
        
        // Disparar evento cuando Firebase esté listo
        document.dispatchEvent(new CustomEvent('firebaseReady'));
    }, 500);
} else {
    console.error('❌ Firebase SDK no cargado');
}

// Exportar configuración
window.firebaseConfig = firebaseConfig;