// llaves.js - Versión con categorías en pestañas
document.addEventListener('DOMContentLoaded', function() {
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(tc => tc.classList.remove('active'));
            
            tab.classList.add('active');
            document.getElementById(`${tabId}-tab`).classList.add('active');
            
            if (tabId === 'brackets') generarLlavesEliminatorias();
        });
    });
});

window.generarLlavesEliminatorias = function() {
    const bracketsContainer = document.getElementById('bracketsContainer');
    bracketsContainer.innerHTML = `
        <div class="empty-match">
            <i class="fas fa-spinner fa-spin"></i>
            <h3>Generando llaves de eliminatorias</h3>
            <p>Procesando equipos clasificados...</p>
        </div>
    `;
    
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

// En llaves.js, modificar la función generarLlavesConEliminatoriasReales
function generarLlavesConEliminatoriasReales(datos) {
    const bracketsContainer = document.getElementById('bracketsContainer');
    bracketsContainer.innerHTML = '';
    
    let llavesGeneradas = false;
    
    // Agrupar datos por categoría
    const categorias = {};
    
    for (const [categoriaKey, categoria] of Object.entries(datos)) {
        // Extraer información de categoría de la clave
        const partes = categoriaKey.split('_');
        let nombreCategoria = categoria.nombre || formatearNombreCategoria(categoriaKey);
        
        // Si es una categoría de Punto de Oro, extraer más detalles
        if (partes.length >= 3) {
            const tipo = partes[1] === 'femenino' ? 'Femenino' : 'Masculino';
            const nivel = partes[2].charAt(0).toUpperCase() + partes[2].slice(1);
            nombreCategoria = `${nivel} ${tipo}`;
        }
        
        if (!categorias[nombreCategoria]) {
            categorias[nombreCategoria] = [];
        }
        
        categorias[nombreCategoria].push({
            key: categoriaKey,
            data: categoria
        });
    }
    
    // ORDENAR LAS CATEGORÍAS DE MENOR A MAYOR
    const ordenCategorias = [
        '4ta Femenino', '5ta Femenino', '6ta Femenino', '8va Femenino',
        '4ta Masculino', '6ta Masculino', '8va Masculino'
    ];
    
    // Crear un objeto ordenado
    const categoriasOrdenadas = {};
    ordenCategorias.forEach(cat => {
        if (categorias[cat]) {
            categoriasOrdenadas[cat] = categorias[cat];
        }
    });
    
    // Añadir cualquier categoría que no esté en la lista ordenada
    Object.keys(categorias).forEach(cat => {
        if (!categoriasOrdenadas[cat]) {
            categoriasOrdenadas[cat] = categorias[cat];
        }
    });
    
    // Crear pestañas para cada categoría
    const categoryTabsContainer = document.createElement('div');
    categoryTabsContainer.className = 'category-tabs-container';
    
    const categoryTabs = document.createElement('ul');
    categoryTabs.className = 'category-tabs';
    
    const categoryContents = document.createElement('div');
    categoryContents.className = 'category-contents';
    
    let firstTab = true;
    
    // Generar pestañas y contenido para cada categoría (usando categoriasOrdenadas)
    for (const [nombreCategoria, torneos] of Object.entries(categoriasOrdenadas)) {
        let tieneEliminatorias = false;
        
        // Verificar si esta categoría tiene eliminatorias
        for (const torneo of torneos) {
            const eliminatorias = torneo.data.eliminatorias;
            if (eliminatorias && Object.keys(eliminatorias).length > 0) {
                tieneEliminatorias = true;
                llavesGeneradas = true;
                break;
            }
        }
        
        if (!tieneEliminatorias) continue;
        
        // Crear pestaña para esta categoría
        const tabId = nombreCategoria.toLowerCase().replace(/\s+/g, '-');
        const tab = document.createElement('li');
        tab.className = `category-tab ${firstTab ? 'active' : ''}`;
        tab.setAttribute('data-category-tab', tabId);
        tab.textContent = nombreCategoria;
        tab.addEventListener('click', () => {
            // Activar esta pestaña y desactivar las demás
            document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.category-content').forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(`category-${tabId}`).classList.add('active');
        });
        categoryTabs.appendChild(tab);
        
        // Crear contenido para esta categoría
        const categoryContent = document.createElement('div');
        categoryContent.className = `category-content ${firstTab ? 'active' : ''}`;
        categoryContent.id = `category-${tabId}`;
        
        const torneosContainer = document.createElement('div');
        torneosContainer.className = 'tournaments-container';
        
        for (const torneo of torneos) {
            const eliminatorias = torneo.data.eliminatorias;
            
            if (eliminatorias && Object.keys(eliminatorias).length > 0) {
                const tournamentDiv = document.createElement('div');
                tournamentDiv.className = 'tournament-bracket';
                
                // Añadir subtítulo para el torneo si es necesario
                if (torneos.length > 1) {
                    const subTitle = document.createElement('h3');
                    subTitle.className = 'tournament-subtitle';
                    subTitle.textContent = torneo.data.nombre || '';
                    tournamentDiv.appendChild(subTitle);
                }
                
                const bracketDiv = document.createElement('div');
                bracketDiv.className = 'bracket';
                bracketDiv.id = `bracket-${torneo.key.replace(/\s+/g, '-')}`;
                
                const fases = ['dieciseisavos', 'octavos', 'cuartos', 'semis', 'final'];
                
                fases.forEach((fase, index) => {
                    if (eliminatorias[fase]) {
                        generarFaseEliminatoria(
                            bracketDiv, 
                            fase, 
                            eliminatorias[fase], 
                            index, 
                            fases.length,
                            torneo.data.clasificados
                        );
                    }
                });
                
                tournamentDiv.appendChild(bracketDiv);
                torneosContainer.appendChild(tournamentDiv);
            }
        }
        
        categoryContent.appendChild(torneosContainer);
        categoryContents.appendChild(categoryContent);
        
        firstTab = false;
    }
    
    if (llavesGeneradas) {
        categoryTabsContainer.appendChild(categoryTabs);
        categoryTabsContainer.appendChild(categoryContents);
        bracketsContainer.appendChild(categoryTabsContainer);
    } else {
        mostrarMensajeSinEliminatorias();
    }
}

function generarFaseEliminatoria(bracketDiv, nombreFase, partidosFase, index, totalFases, clasificados) {
    const roundDiv = document.createElement('div');
    roundDiv.className = 'round compact-round';
    roundDiv.setAttribute('data-phase', nombreFase);
    
    const roundTitle = document.createElement('div');
    roundTitle.className = 'round-title compact-round-title';
    roundTitle.innerHTML = `<i class="fas ${obtenerIconoTipo(nombreFase)}"></i>${formatearNombreFaseCorta(nombreFase)}`;
    roundDiv.appendChild(roundTitle);
    
    const partidos = Array.isArray(partidosFase) ? partidosFase : [partidosFase];
    
    partidos.forEach((partido, partidoIndex) => {
        const matchDiv = document.createElement('div');
        matchDiv.className = 'match compact-match';
        matchDiv.setAttribute('data-match-id', `${nombreFase}-${partidoIndex}`);
        matchDiv.setAttribute('data-phase', nombreFase);
        matchDiv.setAttribute('data-index', partidoIndex);
        
        if (partido.equipo1 && partido.equipo1.includes('Ganador P')) {
            const matchRef = partido.equipo1.match(/Ganador P(\d+)/);
            if (matchRef) {
                const refIndex = parseInt(matchRef[1]) - 1;
                matchDiv.setAttribute('data-ref-source-1', obtenerFaseAnterior(nombreFase));
                matchDiv.setAttribute('data-ref-index-1', refIndex);
            }
        }
        
        if (partido.equipo2 && partido.equipo2.includes('Ganador P')) {
            const matchRef = partido.equipo2.match(/Ganador P(\d+)/);
            if (matchRef) {
                const refIndex = parseInt(matchRef[1]) - 1;
                matchDiv.setAttribute('data-ref-source-2', obtenerFaseAnterior(nombreFase));
                matchDiv.setAttribute('data-ref-index-2', refIndex);
            }
        }
        
        if (nombreFase === 'final') {
            matchDiv.style.background = '#fff3e0';
            matchDiv.style.border = '2px solid #FF8C00';
        }
        
        const team1Div = crearEquipoDivCompacto(partido.equipo1, partido.resultado || partido.games, true, clasificados);
        const team2Div = crearEquipoDivCompacto(partido.equipo2, partido.resultado || partido.games, false, clasificados);
        
        matchDiv.appendChild(team1Div);
        matchDiv.appendChild(team2Div);
        
        const scoreDiv = document.createElement('div');
        scoreDiv.className = 'match-score compact-score';
        
        if (partido.games && partido.games !== 'A definir' && partido.games !== '') {
            scoreDiv.textContent = partido.games;
        } else if (partido.resultado && partido.resultado !== 'A definir') {
            scoreDiv.textContent = partido.resultado;
        } else {
            scoreDiv.textContent = 'A definir';
            scoreDiv.classList.add('resultado-pendiente');
        }
        
        if (nombreFase === 'final') {
            scoreDiv.style.background = '#FF8C00';
            scoreDiv.style.color = 'white';
        }
        
        matchDiv.appendChild(scoreDiv);
        
        const infoDiv = document.createElement('div');
        infoDiv.className = 'match-info compact-info';
        infoDiv.textContent = partido.fecha && partido.fecha !== 'A definir' ? 
            partido.fecha : obtenerInfoPartidoReal(nombreFase, partidoIndex);
        
        matchDiv.appendChild(infoDiv);
        roundDiv.appendChild(matchDiv);
    });
    
    bracketDiv.appendChild(roundDiv);
}

function obtenerFaseAnterior(faseActual) {
    const fases = {
        'octavos': 'dieciseisavos',
        'cuartos': 'octavos',
        'semis': 'cuartos',
        'final': 'semis'
    };
    return fases[faseActual] || 'dieciseisavos';
}

function conectarPartidos(partidoOrigen, partidoDestino, lado = 'left') {
    const contenedor = partidoOrigen.closest('.bracket');
    const contenedorRect = contenedor.getBoundingClientRect();
    
    const origenRect = partidoOrigen.getBoundingClientRect();
    const destinoRect = partidoDestino.getBoundingClientRect();
    
    const origenX = origenRect.right - contenedorRect.left;
    const origenY = origenRect.top + origenRect.height / 2 - contenedorRect.top;
    const destinoX = destinoRect.left - contenedorRect.left;
    const destinoY = destinoRect.top + destinoRect.height / 2 - contenedorRect.top;
    
    const puntoOrigenX = lado === 'left' ? origenX : origenRect.left - contenedorRect.left + origenRect.width;
    const puntoDestinoX = lado === 'left' ? destinoX : destinoRect.left - contenedorRect.left;
    
    const linea = document.createElement('div');
    linea.className = 'conexion-partido compact-line';
    
    const width = Math.abs(puntoDestinoX - puntoOrigenX);
    const height = Math.abs(destinoY - origenY);
    const top = Math.min(origenY, destinoY);
    const left = Math.min(puntoOrigenX, puntoDestinoX);
    
    linea.style.position = 'absolute';
    linea.style.top = `${top}px`;
    linea.style.left = `${left}px`;
    linea.style.width = `${width}px`;
    linea.style.height = `${height}px`;
    linea.style.zIndex = '1';
    
    if (destinoY > origenY) {
        if (puntoDestinoX > puntoOrigenX) {
            linea.style.borderRight = '2px solid #3498db';
            linea.style.borderBottom = '2px solid #3498db';
        } else {
            linea.style.borderLeft = '2px solid #3498db';
            linea.style.borderBottom = '2px solid #3498db';
        }
    } else {
        if (puntoDestinoX > puntoOrigenX) {
            linea.style.borderRight = '2px solid #3498db';
            linea.style.borderTop = '2px solid #3498db';
        } else {
            linea.style.borderLeft = '2px solid #3498db';
            linea.style.borderTop = '2px solid #3498db';
        }
    }
    
    contenedor.appendChild(linea);
}

function crearEquipoDivCompacto(nombreEquipo, resultado, esEquipo1, clasificados) {
    const teamDiv = document.createElement('div');
    teamDiv.className = 'team compact-team';
    
    if (resultado && resultado !== 'A definir' && resultado !== '-' && resultado !== '') {
        const ganador = determinarGanadorPorGames(resultado);
        if ((esEquipo1 && ganador === 1) || (!esEquipo1 && ganador === 2)) {
            teamDiv.classList.add('winner');
            const corona = document.createElement('i');
            corona.className = 'fas fa-crown compact-crown';
            teamDiv.appendChild(corona);
        }
    }
    
    const teamName = document.createElement('div');
    teamName.className = 'team-name compact-team-name';
    
    let textoEquipo = nombreEquipo;
    if (clasificados) {
        for (const [clave, equipo] of Object.entries(clasificados)) {
            if (equipo === nombreEquipo) {
                const match = clave.match(/(\w+)\s([A-Z])/);
                if (match) textoEquipo = `${nombreEquipo} (${match[1]} ${match[2]})`;
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
            if (set.games1 > set.games2) setsGanados1++;
            else if (set.games2 > set.games1) setsGanados2++;
        });
        
        return setsGanados1 > setsGanados2 ? 1 : 2;
    } catch (error) {
        return null;
    }
}

function formatearNombreFaseCorta(nombreFase) {
    const nombres = {
        'dieciseisavos': '16vos',
        'octavos': 'Octavos', 
        'cuartos': 'Cuartos',
        'semis': 'Semis',
        'final': 'Final'
    };
    return nombres[nombreFase] || nombreFase;
}

function obtenerIconoTipo(tipo) {
    const iconos = {
        'dieciseisavos': 'fa-chess-pawn',
        'octavos': 'fa-chess-knight',
        'cuartos': 'fa-chess-bishop',
        'semis': 'fa-chess-rook',
        'final': 'fa-chess-king'
    };
    return iconos[tipo] || 'fa-chess';
}

function obtenerInfoPartidoReal(tipo, partidoIndex) {
    const horasBase = {
        'dieciseisavos': ['09:00', '10:00', '11:00', '12:00'],
        'octavos': ['13:00', '14:00', '15:00', '16:00'],
        'cuartos': ['16:00', '17:00'],
        'semifinales': ['18:00', '19:00'],
        'final': ['20:00']
    };
    
    const canchas = ['C1', 'C2', 'C3', 'C4', 'CC', 'CA'];
    const horas = horasBase[tipo] || ['10:00'];
    
    return `${horas[partidoIndex % horas.length]} - ${canchas[partidoIndex % canchas.length]}`;
}

function mostrarErrorDatos() {
    const bracketsContainer = document.getElementById('bracketsContainer');
    bracketsContainer.innerHTML = `
        <div class="empty-match">
            <i class="fas fa-exclamation-triangle" style="color: #e74c3c;"></i>
            <h3>Datos no disponibles</h3>
            <p>Los datos de torneos no se han cargado correctamente.</p>
            <button onclick="location.reload()">Recargar página</button>
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
        </div>
    `;
}

function formatearNombreCategoria(clave) {
    const partes = clave.split('_');
    if (partes.length >= 3) {
        const genero = partes[1] === 'femenino' ? 'Femenino' : 'Masculino';
        const nivel = partes[2].charAt(0).toUpperCase() + partes[2].slice(1);
        return `${nivel} ${genero}`;
    }
    return clave;
}

// Estilos compactos
const compactStyles = document.createElement('style');
compactStyles.textContent = `
    .compact-view { margin-bottom: 30px; }
    .compact-title { padding: 12px 15px; font-size: 16px; }
    .compact-bracket { gap: 15px; padding: 10px 0; }
    .compact-round { min-width: 180px; gap: 12px; }
    .compact-round-title { padding: 8px 10px; font-size: 12px; }
    .compact-match { min-height: 80px; }
    .compact-team { padding: 8px 10px; min-height: 35px; }
    .compact-team-name { font-size: 12px; }
    .compact-score { padding: 6px; font-size: 12px; }
    .compact-info { padding: 5px; font-size: 10px; }
    .compact-crown { font-size: 10px; margin-left: 3px; }
    .compact-line { border-width: 1px !important; }
    
    @media (max-width: 768px) {
        .compact-round { min-width: 150px; }
        .compact-team-name { font-size: 11px; }
    }
    
    @media (max-width: 480px) {
        .compact-round { min-width: 130px; }
        .compact-round-title { font-size: 11px; }
        .compact-team-name { font-size: 10px; }
    }
    
    /* Estilos para la separación de categorías */
    .tournaments-container {
        display: flex;
        flex-direction: column;
        gap: 25px;
        margin-top: 15px;
    }
    
    .tournament-bracket {
        background: rgba(255, 255, 255, 0.8);
        border-radius: 10px;
        padding: 15px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    .tournament-subtitle {
        text-align: center;
        color: #2c3e50;
        margin-bottom: 15px;
        padding-bottom: 8px;
        border-bottom: 2px solid #FF8C00;
        font-size: 18px;
        font-weight: 600;
    }
    
    .bracket-category {
        margin-bottom: 40px;
        background: white;
        border-radius: 12px;
        padding: 25px;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
        border: 1px solid #e0e0e0;
    }
    
    .bracket-category:last-child {
        margin-bottom: 20px;
    }
    
    @media (max-width: 768px) {
        .tournament-bracket {
            padding: 10px;
        }
        
        .bracket-category {
            padding: 15px;
            margin-bottom: 30px;
        }
        
        .tournament-subtitle {
            font-size: 16px;
        }
    }
`;
document.head.appendChild(compactStyles);