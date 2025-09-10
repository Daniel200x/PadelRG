// llaves.js - Versión compacta con conexiones visuales
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
        setTimeout(dibujarTodasLasConexiones, 300);
    }, 100);
};

function generarLlavesConEliminatoriasReales(datos) {
    const bracketsContainer = document.getElementById('bracketsContainer');
    bracketsContainer.innerHTML = '';
    
    let llavesGeneradas = false;
    
    for (const [categoriaKey, categoria] of Object.entries(datos)) {
        const eliminatorias = categoria.eliminatorias;
        
        if (eliminatorias && Object.keys(eliminatorias).length > 0) {
            llavesGeneradas = true;
            
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'bracket-category compact-view';
            
            const titleDiv = document.createElement('div');
            titleDiv.className = 'bracket-title compact-title';
            titleDiv.innerHTML = `
                <i class="fas fa-trophy"></i>
                ${categoria.nombre || formatearNombreCategoria(categoriaKey)}
                <div>Fase Eliminatoria</div>
            `;
            categoryDiv.appendChild(titleDiv);
            
            const bracketDiv = document.createElement('div');
            bracketDiv.className = 'bracket compact-bracket';
            bracketDiv.id = `bracket-${categoriaKey.replace(/\s+/g, '-')}`;
            
            const fases = ['dieciseisavos', 'octavos', 'cuartos', 'semis', 'final'];
            
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
    
    if (!llavesGeneradas) mostrarMensajeSinEliminatorias();
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

function dibujarTodasLasConexiones() {
    document.querySelectorAll('.conexion-partido').forEach(el => el.remove());
    
    conectarFase('dieciseisavos', 'octavos');
    conectarFase('octavos', 'cuartos');
    conectarFase('cuartos', 'semis');
    conectarFase('semis', 'final');
}

function conectarFase(faseOrigen, faseDestino) {
    const partidosDestino = document.querySelectorAll(`.round[data-phase="${faseDestino}"] .match`);
    
    partidosDestino.forEach(partidoDestino => {
        const refSource1 = partidoDestino.getAttribute('data-ref-source-1');
        const refIndex1 = partidoDestino.getAttribute('data-ref-index-1');
        const refSource2 = partidoDestino.getAttribute('data-ref-source-2');
        const refIndex2 = partidoDestino.getAttribute('data-ref-index-2');
        
        if (refSource1 === faseOrigen && refIndex1 !== null) {
            const partidoOrigen = document.querySelector(`.round[data-phase="${faseOrigen}"] .match:nth-child(${parseInt(refIndex1) + 1})`);
            if (partidoOrigen) conectarPartidos(partidoOrigen, partidoDestino, 'left');
        }
        
        if (refSource2 === faseOrigen && refIndex2 !== null) {
            const partidoOrigen = document.querySelector(`.round[data-phase="${faseOrigen}"] .match:nth-child(${parseInt(refIndex2) + 1})`);
            if (partidoOrigen) conectarPartidos(partidoOrigen, partidoDestino, 'right');
        }
        
        if (!refSource1 && !refSource2) {
            const equipo1 = partidoDestino.querySelector('.team:first-child .team-name').textContent;
            const equipo2 = partidoDestino.querySelector('.team:last-child .team-name').textContent;
            
            if (equipo1.includes('Ganador P') || equipo2.includes('Ganador P')) {
                const refMatch1 = equipo1.match(/Ganador P(\d+)/);
                const refMatch2 = equipo2.match(/Ganador P(\d+)/);
                
                if (refMatch1) {
                    const partidoId = parseInt(refMatch1[1]) - 1;
                    const partidoOrigen = document.querySelector(`.round[data-phase="${faseOrigen}"] .match:nth-child(${partidoId + 1})`);
                    if (partidoOrigen) conectarPartidos(partidoOrigen, partidoDestino, 'left');
                }
                
                if (refMatch2) {
                    const partidoId = parseInt(refMatch2[1]) - 1;
                    const partidoOrigen = document.querySelector(`.round[data-phase="${faseOrigen}"] .match:nth-child(${partidoId + 1})`);
                    if (partidoOrigen) conectarPartidos(partidoOrigen, partidoDestino, 'right');
                }
            }
        }
    });
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
        const genero = partes[1] === 'femenino' ? 'Fem' : 'Masc';
        return `${partes[2]} ${genero}`;
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
`;
document.head.appendChild(compactStyles);