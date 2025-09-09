// llaves.js - Versión que usa las eliminatorias reales procesadas
document.addEventListener('DOMContentLoaded', function() {
    // Configurar pestañas
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(tc => tc.classList.remove('active'));
            
            tab.classList.add('active');
            document.getElementById(`${tabId}-tab`).classList.add('active');
            
            if (tabId === 'brackets') {
                generarLlavesEliminatorias();
            }
        });
    });
});

window.verificarEstructuraDatos = function() {
    console.clear();
    console.log("=== VERIFICACIÓN DE ESTRUCTURA DE DATOS ===");
    
    if (!window.torneosData || Object.keys(window.torneosData).length === 0) {
        console.log("No hay datos disponibles");
        alert("No hay datos de torneos disponibles. Por favor, recarga la página.");
        return;
    }
    
    for (const [categoriaKey, categoria] of Object.entries(window.torneosData)) {
        console.log(`\n--- ${categoriaKey} ---`);
        console.log("Estructura completa:", categoria);
        
        if (categoria.grupos && Array.isArray(categoria.grupos)) {
            console.log(`✓ Grupos encontrados: ${categoria.grupos.length}`);
        }
        
        if (categoria.eliminatorias) {
            console.log("✓ Eliminatorias encontradas:", Object.keys(categoria.eliminatorias));
        }
    }
    
    alert("Verificación completada. Revisa la consola (F12) para ver los detalles.");
};

window.verificarDatosProcesados = function() {
    console.clear();
    console.log("=== DATOS PROCESADOS ===");
    
    if (window.datosProcesados && Object.keys(window.datosProcesados).length > 0) {
        console.log("Datos procesados disponibles:", window.datosProcesados);
        
        for (const [categoria, datos] of Object.entries(window.datosProcesados)) {
            console.log(`\n--- ${categoria} ---`);
            console.log("Clasificados:", datos.clasificados);
            
            if (datos.eliminatorias) {
                console.log("Eliminatorias procesadas:");
                Object.entries(datos.eliminatorias).forEach(([fase, partidos]) => {
                    console.log(`  ${fase}:`, partidos);
                });
            }
        }
    } else {
        console.log("No hay datos procesados disponibles");
    }
    
    alert("Verificación de datos procesados completada. Revisa la consola (F12).");
};

window.generarLlavesEliminatorias = function() {
    const bracketsContainer = document.getElementById('bracketsContainer');
    bracketsContainer.innerHTML = `
        <div class="empty-match">
            <i class="fas fa-spinner fa-spin"></i>
            <h3>Generando llaves de eliminatorias</h3>
            <p>Procesando equipos clasificados...</p>
        </div>
    `;
    
    // Usar datos procesados si están disponibles, sino los originales
    const datosUsar = window.datosProcesados && Object.keys(window.datosProcesados).length > 0 ? 
        window.datosProcesados : window.torneosData;
    
    if (!datosUsar || Object.keys(datosUsar).length === 0) {
        mostrarErrorDatos();
        return;
    }
    
    setTimeout(() => {
        generarLlavesConEliminatoriasReales(datosUsar);
    }, 100);
};

function generarLlavesConEliminatoriasReales(datos) {
    const bracketsContainer = document.getElementById('bracketsContainer');
    bracketsContainer.innerHTML = '';
    
    let llavesGeneradas = false;
    
    for (const [categoriaKey, categoria] of Object.entries(datos)) {
        // Verificar si tenemos eliminatorias
        const eliminatorias = categoria.eliminatorias;
        
        if (eliminatorias && Object.keys(eliminatorias).length > 0) {
            llavesGeneradas = true;
            
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'bracket-category';
            
            const titleDiv = document.createElement('div');
            titleDiv.className = 'bracket-title';
            titleDiv.innerHTML = `
                <i class="fas fa-trophy" style="margin-right: 10px;"></i>
                ${categoria.nombre || formatearNombreCategoria(categoriaKey)}
                <div style="font-size: 14px; margin-top: 5px; opacity: 0.9;">
                    Fase Eliminatoria
                </div>
            `;
            categoryDiv.appendChild(titleDiv);
            
            const bracketDiv = document.createElement('div');
            bracketDiv.className = 'bracket';
            
            // Generar cada fase de eliminatorias
            const fases = Object.keys(eliminatorias);
            
            fases.forEach((fase, index) => {
                if (eliminatorias[fase]) {
                    generarFaseEliminatoria(
                        bracketDiv, 
                        fase, 
                        eliminatorias[fase], 
                        index, 
                        fases.length,
                        categoria.clasificados
                    );
                }
            });
            
            categoryDiv.appendChild(bracketDiv);
            bracketsContainer.appendChild(categoryDiv);
        }
    }
    
    if (!llavesGeneradas) {
        mostrarMensajeSinEliminatorias();
    }
}

function generarFaseEliminatoria(bracketDiv, nombreFase, partidosFase, index, totalFases, clasificados) {
    const roundDiv = document.createElement('div');
    roundDiv.className = 'round';
    roundDiv.setAttribute('data-phase', obtenerTipoFase(nombreFase));
    
    if (index > 0) {
        roundDiv.classList.add('round-connector');
    }
    
    const roundTitle = document.createElement('div');
    roundTitle.className = 'round-title';
    roundTitle.innerHTML = `<i class="fas ${obtenerIconoTipo(obtenerTipoFase(nombreFase))}" style="margin-right: 8px;"></i>${formatearNombreFase(nombreFase)}`;
    roundDiv.appendChild(roundTitle);
    
    // Si es un objeto (como en "final"), convertirlo a array
    const partidos = Array.isArray(partidosFase) ? partidosFase : [partidosFase];
    
    partidos.forEach((partido, partidoIndex) => {
        const matchDiv = document.createElement('div');
        matchDiv.className = 'match';
        
        // Estilo especial para finales
        if (nombreFase === 'final') {
            matchDiv.style.background = 'linear-gradient(135deg, #fff3e0 0%, #ffecb3 100%)';
            matchDiv.style.border = '3px solid #FF8C00';
        }
        
        const team1Div = crearEquipoDivReal(partido.equipo1, partido.resultado || partido.games, true, clasificados);
        const team2Div = crearEquipoDivReal(partido.equipo2, partido.resultado || partido.games, false, clasificados);
        
        matchDiv.appendChild(team1Div);
        matchDiv.appendChild(team2Div);
        
        const scoreDiv = document.createElement('div');
        scoreDiv.className = 'match-score';
        
        // Mostrar games si están disponibles, sino resultado
        if (partido.games && partido.games !== 'A definir' && partido.games !== '') {
            scoreDiv.textContent = partido.games;
        } else if (partido.resultado && partido.resultado !== 'A definir') {
            scoreDiv.textContent = partido.resultado;
        } else {
            scoreDiv.textContent = 'A definir';
            scoreDiv.classList.add('resultado-pendiente');
        }
        
        // Estilo especial para la final
        if (nombreFase === 'final') {
            scoreDiv.style.background = 'linear-gradient(135deg, #FF8C00 0%, #FF5722 100%)';
            scoreDiv.style.color = 'white';
            scoreDiv.style.fontWeight = '800';
        }
        
        matchDiv.appendChild(scoreDiv);
        
        // Información adicional (fecha, cancha)
        const infoDiv = document.createElement('div');
        infoDiv.className = 'match-info';
        
        if (partido.fecha && partido.fecha !== 'A definir') {
            infoDiv.textContent = partido.fecha;
        } else {
            infoDiv.textContent = obtenerInfoPartidoReal(obtenerTipoFase(nombreFase), partidoIndex, index, totalFases);
        }
        
        matchDiv.appendChild(infoDiv);
        
        roundDiv.appendChild(matchDiv);
    });
    
    bracketDiv.appendChild(roundDiv);
}

function crearEquipoDivReal(nombreEquipo, resultado, esEquipo1, clasificados) {
    const teamDiv = document.createElement('div');
    teamDiv.className = 'team';
    
    // Verificar si este equipo es ganador
    if (resultado && resultado !== 'A definir' && resultado !== '-' && resultado !== '') {
        const ganador = determinarGanadorPorGames(resultado);
        if ((esEquipo1 && ganador === 1) || (!esEquipo1 && ganador === 2)) {
            teamDiv.classList.add('winner');
            
            // Agregar corona al ganador
            const corona = document.createElement('i');
            corona.className = 'fas fa-crown';
            corona.style.marginLeft = '5px';
            corona.style.color = '#FFD700';
            teamDiv.appendChild(corona);
        }
    }
    
    const teamName = document.createElement('div');
    teamName.className = 'team-name';
    
    // Mostrar información del equipo (posición y grupo si está disponible)
    let textoEquipo = nombreEquipo;
    
    // Buscar en los clasificados para obtener información adicional
    if (clasificados) {
        for (const [clave, equipo] of Object.entries(clasificados)) {
            if (equipo === nombreEquipo) {
                // Extraer información de la clave (ej: "1ro A")
                const match = clave.match(/(\w+)\s([A-Z])/);
                if (match) {
                    const posicion = match[1]; // "1ro", "2do"
                    const grupo = match[2];    // "A", "B", etc.
                    textoEquipo = `${nombreEquipo} (${posicion} ${grupo})`;
                }
                break;
            }
        }
    }
    
    teamName.textContent = textoEquipo;
    teamDiv.appendChild(teamName);
    
    return teamDiv;
}

function determinarGanadorPorGames(games) {
    if (!games || games === "A definir") return null;
    
    try {
        const sets = games.split(',').map(set => {
            const [games1, games2] = set.trim().split('-').map(Number);
            return { games1, games2 };
        });
        
        let setsGanados1 = 0;
        let setsGanados2 = 0;
        
        sets.forEach(set => {
            if (set.games1 > set.games2) {
                setsGanados1++;
            } else if (set.games2 > set.games1) {
                setsGanados2++;
            }
        });
        
        return setsGanados1 > setsGanados2 ? 1 : 2;
    } catch (error) {
        console.error('Error al determinar ganador por games:', error);
        return null;
    }
}

function formatearNombreFase(nombreFase) {
    const nombres = {
        'dieciseisavos': '16vos de Final',
        'octavos': 'Octavos de Final', 
        'cuartos': 'Cuartos de Final',
        'semis': 'Semifinales',
        'final': 'Final'
    };
    
    return nombres[nombreFase] || nombreFase;
}

function obtenerTipoFase(nombreFase) {
    if (nombreFase.includes('dieciseisavos')) return 'dieciseisavos';
    if (nombreFase.includes('octavos')) return 'octavos';
    if (nombreFase.includes('cuartos')) return 'cuartos';
    if (nombreFase.includes('semis')) return 'semifinales';
    if (nombreFase.includes('final')) return 'final';
    return 'default';
}

function obtenerIconoTipo(tipo) {
    switch(tipo) {
        case 'dieciseisavos': return 'fa-chess-pawn';
        case 'octavos': return 'fa-chess-knight';
        case 'cuartos': return 'fa-chess-bishop';
        case 'semifinales': return 'fa-chess-rook';
        case 'final': return 'fa-chess-king';
        default: return 'fa-chess';
    }
}

function obtenerInfoPartidoReal(tipo, partidoIndex, faseIndex, totalFases) {
    const horasBase = {
        'dieciseisavos': ['09:00', '10:00', '11:00', '12:00'],
        'octavos': ['13:00', '14:00', '15:00', '16:00'],
        'cuartos': ['16:00', '17:00'],
        'semifinales': ['18:00', '19:00'],
        'final': ['20:00']
    };
    
    const canchas = [
        'Cancha 1', 'Cancha 2', 'Cancha 3', 'Cancha 4',
        'Cancha Central', 'Cancha Auxiliar'
    ];
    
    const horas = horasBase[tipo] || ['10:00'];
    const hora = horas[partidoIndex % horas.length];
    const cancha = canchas[(faseIndex + partidoIndex) % canchas.length];
    
    return `${hora} - ${cancha}`;
}

function mostrarErrorDatos() {
    const bracketsContainer = document.getElementById('bracketsContainer');
    bracketsContainer.innerHTML = `
        <div class="empty-match">
            <i class="fas fa-exclamation-triangle" style="color: #e74c3c;"></i>
            <h3>Datos no disponibles</h3>
            <p>Los datos de torneos no se han cargado correctamente.</p>
            <button onclick="location.reload()" class="btn-reload">
                <i class="fas fa-sync-alt" style="margin-right: 8px;"></i>Recargar página
            </button>
        </div>
    `;
}

function mostrarMensajeSinEliminatorias() {
    const bracketsContainer = document.getElementById('bracketsContainer');
    bracketsContainer.innerHTML = `
        <div class="empty-match">
            <i class="fas fa-trophy" style="color: #ddd;"></i>
            <h3>No hay eliminatorias programadas</h3>
            <p>No se encontraron fases eliminatorias en los datos cargados.</p>
            <p style="font-size: 12px; margin-top: 8px;">
                Las eliminatorias se mostrarán automáticamente cuando estén disponibles en los JSON.
            </p>
            <div class="button-group">
                <button onclick="verificarDatosProcesados()" class="btn-secondary">
                    <i class="fas fa-search" style="margin-right: 8px;"></i>Verificar datos
                </button>
                <button onclick="verificarEstructuraDatos()" class="btn-secondary">
                    <i class="fas fa-database" style="margin-right: 8px;"></i>Ver estructura
                </button>
            </div>
        </div>
    `;
}

function formatearNombreCategoria(clave) {
    const partes = clave.split('_');
    if (partes.length >= 3) {
        const genero = partes[1] === 'femenino' ? 'Femenino' : 'Masculino';
        const categoria = partes[2];
        return `${categoria} ${genero}`;
    }
    return clave;
}

// Agregar estilos dinámicos
const style = document.createElement('style');
style.textContent = `
    .btn-primary {
        background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
        font-weight: 600;
        margin: 4px;
        transition: all 0.3s ease;
        font-size: 13px;
    }
    
    .btn-secondary {
        background: linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%);
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
        font-weight: 600;
        margin: 4px;
        transition: all 0.3s ease;
        font-size: 13px;
    }
    
    .btn-primary:hover, .btn-secondary:hover {
        transform: translateY(-2px);
        box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
    }
    
    .button-group {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        margin-top: 15px;
    }
    
    .btn-reload {
        background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
        font-weight: 600;
        margin-top: 12px;
        transition: all 0.3s ease;
        font-size: 13px;
    }
    
    .resultado-pendiente {
        color: #7f8c8d !important;
        font-style: italic;
    }
    
    .team .fa-crown {
        font-size: 12px;
    }
`;
document.head.appendChild(style);