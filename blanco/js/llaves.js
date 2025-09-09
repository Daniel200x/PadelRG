// llaves.js - Gestión de las llaves de eliminatorias con detección automática de estructura

document.addEventListener('DOMContentLoaded', function() {
    // Configurar event listeners para las pestañas
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            
            // Desactivar todas las pestañas
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(tc => tc.classList.remove('active'));
            
            // Activar la pestaña clickeada
            tab.classList.add('active');
            document.getElementById(`${tabId}-tab`).classList.add('active');
            
            // Si es la pestaña de llaves, generar las llaves
            if (tabId === 'brackets') {
                generarLlavesEliminatorias();
            }
        });
    });
});

// Función principal para generar llaves
function generarLlavesEliminatorias() {
    const bracketsContainer = document.getElementById('bracketsContainer');
    bracketsContainer.innerHTML = '<div class="empty-match"><i class="fas fa-spinner fa-spin"></i> Buscando datos de eliminatorias...</div>';
    
    // Verificar si hay datos disponibles
    if (!window.torneosData || Object.keys(window.torneosData).length === 0) {
        bracketsContainer.innerHTML = `
            <div class="empty-match">
                <i class="fas fa-exclamation-triangle" style="color: #e74c3c;"></i>
                <h3>Datos no disponibles</h3>
                <p>Los datos de torneos no se han cargado correctamente.</p>
                <button onclick="location.reload()" style="margin-top: 15px; padding: 10px 20px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    Recargar página
                </button>
            </div>
        `;
        return;
    }
    
    // Procesar datos después de un breve delay para permitir que se muestre el mensaje de carga
    setTimeout(() => {
        procesarDatosYGenerarLlaves();
    }, 100);
}

// Función para procesar datos y generar llaves
function procesarDatosYGenerarLlaves() {
    const bracketsContainer = document.getElementById('bracketsContainer');
    bracketsContainer.innerHTML = '';
    
    let tieneEliminatorias = false;
    
    // Recorrer todas las categorías
    for (const [categoriaKey, categoria] of Object.entries(window.torneosData)) {
        // Intentar encontrar eliminatorias en diferentes estructuras
        const estructurasEliminatorias = [
            categoria.eliminatorias,
            categoria.llaves, 
            categoria.bracket,
            categoria.finales,
            categoria.playoffs,
            categoria.knockout
        ].filter(e => e && Array.isArray(e) && e.length > 0);
        
        if (estructurasEliminatorias.length > 0) {
            tieneEliminatorias = true;
            estructurasEliminatorias[0].forEach((ronda, index) => {
                generarRonda(ronda, categoriaKey, index, bracketsContainer);
            });
        } else {
            // Buscar partidos de eliminatoria en otras estructuras
            const partidos = categoria.partidos || [];
            const partidosEliminatoria = partidos.filter(p => 
                (p.fase && (p.fase.toLowerCase().includes('eliminatoria') || p.fase.toLowerCase().includes('final'))) ||
                (p.tipo && (p.tipo.toLowerCase().includes('eliminatoria') || p.tipo.toLowerCase().includes('final'))) ||
                (p.fecha && (p.fecha.includes('Sabado') || p.fecha.includes('Domingo') || p.fecha.includes('Sábado') || p.fecha.includes('Domingo')))
            );
            
            if (partidosEliminatoria.length > 0) {
                tieneEliminatorias = true;
                generarRonda({
                    nombre: "Eliminatorias",
                    partidos: partidosEliminatoria
                }, categoriaKey, 0, bracketsContainer);
            }
        }
    }
    
    // Si no se encontraron eliminatorias
    if (!tieneEliminatorias) {
        mostrarMensajeSinDatos();
    }
}

// Función para generar una ronda de eliminatorias
function generarRonda(ronda, categoriaKey, index, bracketsContainer) {
    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'bracket-category';
    
    const titleDiv = document.createElement('div');
    titleDiv.className = 'bracket-title';
    titleDiv.textContent = (window.torneosData[categoriaKey].nombre || formatearNombreCategoria(categoriaKey)) + 
                          " - " + (ronda.nombre || `Ronda ${index + 1}`);
    categoryDiv.appendChild(titleDiv);
    
    const bracketDiv = document.createElement('div');
    bracketDiv.className = 'bracket';
    
    const roundDiv = document.createElement('div');
    roundDiv.className = 'round';
    
    if (index > 0) {
        roundDiv.classList.add('round-connector');
    }
    
    const roundTitle = document.createElement('div');
    roundTitle.className = 'round-title';
    roundTitle.textContent = ronda.nombre || `Ronda ${index + 1}`;
    roundDiv.appendChild(roundTitle);
    
    // Procesar partidos
    if (ronda.partidos && ronda.partidos.length > 0) {
        ronda.partidos.forEach(partido => {
            const matchDiv = crearPartido(partido);
            roundDiv.appendChild(matchDiv);
        });
    } else {
        const emptyMatch = document.createElement('div');
        emptyMatch.className = 'empty-match';
        emptyMatch.textContent = 'No hay partidos programados';
        roundDiv.appendChild(emptyMatch);
    }
    
    bracketDiv.appendChild(roundDiv);
    categoryDiv.appendChild(bracketDiv);
    bracketsContainer.appendChild(categoryDiv);
}

// Función para crear un partido
function crearPartido(partido) {
    const matchDiv = document.createElement('div');
    matchDiv.className = 'match';
    
    // Equipo 1
    const team1Div = crearEquipoDiv(partido.equipo1, partido.semilla1, partido.resultado, true);
    matchDiv.appendChild(team1Div);
    
    // Equipo 2
    const team2Div = crearEquipoDiv(partido.equipo2, partido.semilla2, partido.resultado, false);
    matchDiv.appendChild(team2Div);
    
    // Resultado
    if (partido.resultado && partido.resultado !== '-' && partido.resultado !== 'A definir') {
        const scoreDiv = document.createElement('div');
        scoreDiv.className = 'match-score';
        scoreDiv.textContent = partido.resultado;
        matchDiv.appendChild(scoreDiv);
    }
    
    // Información adicional
    if (partido.fecha || partido.cancha) {
        const infoDiv = document.createElement('div');
        infoDiv.className = 'match-info';
        
        let infoText = '';
        if (partido.fecha && partido.fecha !== 'A definir') {
            infoText += partido.fecha;
        }
        if (partido.cancha && partido.cancha !== 'Por definir') {
            if (infoText) infoText += ' - ';
            infoText += partido.cancha;
        }
        
        infoDiv.textContent = infoText || '';
        matchDiv.appendChild(infoDiv);
    }
    
    return matchDiv;
}

// Función para mostrar mensaje cuando no hay datos
function mostrarMensajeSinDatos() {
    const bracketsContainer = document.getElementById('bracketsContainer');
    bracketsContainer.innerHTML = `
        <div class="empty-match">
            <i class="fas fa-trophy" style="font-size: 48px; margin-bottom: 15px; color: #ddd;"></i>
            <h3>Eliminatorias no disponibles</h3>
            <p>No se encontraron datos de eliminatorias en la estructura actual.</p>
            <div style="margin-top: 20px;">
                <button onclick="verificarEstructuraDatos()" style="margin: 5px; padding: 10px 20px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    Verificar estructura de datos
                </button>
                <button onclick="location.reload()" style="margin: 5px; padding: 10px 20px; background: #2ecc71; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    Recargar página
                </button>
            </div>
        </div>
    `;
}

// Resto de las funciones auxiliares (crearEquipoDiv, formatearNombreCategoria) se mantienen igual

// Función auxiliar para crear elemento de equipo
function crearEquipoDiv(nombreEquipo, semilla, resultado, esEquipo1) {
    const teamDiv = document.createElement('div');
    teamDiv.className = 'team';
    
    // Detectar si es ganador
    if (resultado && resultado !== '-' && resultado !== 'A definir') {
        const [sets1, sets2] = resultado.split('-').map(Number);
        if ((esEquipo1 && sets1 > sets2) || (!esEquipo1 && sets2 > sets1)) {
            teamDiv.classList.add('winner');
        }
    }
    
    const teamName = document.createElement('div');
    teamName.className = 'team-name';
    teamName.textContent = nombreEquipo || 'Por definir';
    teamDiv.appendChild(teamName);
    
    // Semilla del equipo (si existe)
    if (semilla) {
        const seed = document.createElement('span');
        seed.className = 'team-seed';
        seed.textContent = semilla;
        teamDiv.appendChild(seed);
    }
    
    return teamDiv;
}

// Función para formatear el nombre de la categoría a partir de la clave
function formatearNombreCategoria(clave) {
    const partes = clave.split('/');
    const ultimaParte = partes[partes.length - 1];
    
    // Determinar género
    const esFemenino = clave.includes('femenino');
    const genero = esFemenino ? 'Femenino' : 'Masculino';
    
    // Determinar categoría
    let categoria = '';
    if (ultimaParte.includes('4ta')) categoria = '4ta';
    else if (ultimaParte.includes('6ta')) categoria = '6ta';
    else if (ultimaParte.includes('8va')) categoria = '8va';
    else categoria = ultimaParte;
    
    return `${categoria} ${genero}`;
}