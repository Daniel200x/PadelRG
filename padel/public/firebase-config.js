// firebase-config.js
// Configuración de Firebase - REEMPLAZAR CON TUS DATOS REALES

// Tu configuración de Firebase (la obtendrás en el siguiente paso)
const firebaseConfig = {
  apiKey: "AIzaSyB8hWvmisya70XCG59ShP1HxwXzpS6c8m8",
  authDomain: "padelfuego.firebaseapp.com",
  projectId: "padelfuego",
  storageBucket: "padelfuego.firebasestorage.app",
  messagingSenderId: "926116172976",
  appId: "1:926116172976:web:652fb988edad88e4ec1775",
  measurementId: "G-BGH0L0C6SV"
};

// Inicializar Firebase solo una vez
try {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
        console.log("✅ Firebase inicializado");
    } else {
        console.log("✅ Firebase ya estaba inicializado");
    }
    
    // Asignar Firestore a variable global
    window.db = firebase.firestore();
    console.log("✅ Firestore asignado a window.db");
    
} catch (error) {
    console.error("❌ Error inicializando Firebase:", error);
}