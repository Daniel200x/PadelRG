// llaves.js - Solución definitiva con conexiones precisas
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
    
    // Pequeño delay para asegurar que el DOM esté listo
    setTimeout(() => {
        generarLlavesConEliminatoriasReales(datosUsar);
        
        // Esperar a que el DOM se renderice completamente antes de dibujar conexiones
        setTimeout(() => {
            dibujarTodasLasConexiones();
            // Re-dibujar después de un breve momento para asegurar que todo esté renderizado
            setTimeout(dibujarTodasLasConexiones, 100);
        }, 300);
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
            bracketDiv.id = `bracket-${categoriaKey.replace(/\s+/g, '-')}`;
            
            // Generar cada fase de eliminatorias en orden
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
    
    if (!llavesGeneradas) {
        mostrarMensajeSinEliminatorias();
    }
}

function generarFaseEliminatoria(bracketDiv, nombreFase, partidosFase, index, totalFases, clasificados) {
    const roundDiv = document.createElement('div');
    roundDiv.className = 'round';
    roundDiv.setAttribute('data-phase', nombreFase);
    roundDiv.setAttribute('data-fase-index', index);
    
    if (index > 0) {
        roundDiv.classList.add('round-connector');
    }
    
    const roundTitle = document.createElement('div');
    roundTitle.className = 'round-title';
    roundTitle.innerHTML = `<i class="fas ${obtenerIconoTipo(nombreFase)}" style="margin-right: 8px;"></i>${formatearNombreFase(nombreFase)}`;
    roundDiv.appendChild(roundTitle);
    
    // Si es un objeto (como en "final"), convertirlo a array
    const partidos = Array.isArray(partidosFase) ? partidosFase : [partidosFase];
    
    partidos.forEach((partido, partidoIndex) => {
        const matchDiv = document.createElement('div');
        matchDiv.className = 'match';
        matchDiv.setAttribute('data-match-id', `${nombreFase}-${partidoIndex}`);
        matchDiv.setAttribute('data-phase', nombreFase);
        matchDiv.setAttribute('data-index', partidoIndex);
        
        // Almacenar información de referencia para conexiones
        if (partido.equipo1 && partido.equipo1.includes('Ganador P')) {
            const matchRef = partido.equipo1.match(/Ganador P(\d+)/);
            if (matchRef) {
                const refIndex = parseInt(matchRef[1]) - 1;
                matchDiv.setAttribute('data-ref-1', `dieciseisavos-${refIndex}`);
                // Para octavos, la referencia es a 16vos
                if (nombreFase === 'octavos') {
                    matchDiv.setAttribute('data-ref-source-1', 'dieciseisavos');
                    matchDiv.setAttribute('data-ref-index-1', refIndex);
                }
                // Para cuartos, la referencia es a octavos, etc.
                else if (nombreFase === 'cuartos') {
                    matchDiv.setAttribute('data-ref-source-1', 'octavos');
                    matchDiv.setAttribute('data-ref-index-1', refIndex);
                }
                else if (nombreFase === 'semis') {
                    matchDiv.setAttribute('data-ref-source-1', 'cuartos');
                    matchDiv.setAttribute('data-ref-index-1', refIndex);
                }
                else if (nombreFase === 'final') {
                    matchDiv.setAttribute('data-ref-source-1', 'semis');
                    matchDiv.setAttribute('data-ref-index-1', refIndex);
                }
            }
        }
        
        if (partido.equipo2 && partido.equipo2.includes('Ganador P')) {
            const matchRef = partido.equipo2.match(/Ganador P(\d+)/);
            if (matchRef) {
                const refIndex = parseInt(matchRef[1]) - 1;
                matchDiv.setAttribute('data-ref-2', `dieciseisavos-${refIndex}`);
                // Para octavos, la referencia es a 16vos
                if (nombreFase === 'octavos') {
                    matchDiv.setAttribute('data-ref-source-2', 'dieciseisavos');
                    matchDiv.setAttribute('data-ref-index-2', refIndex);
                }
                // Para cuartos, la referencia es a octavos, etc.
                else if (nombreFase === 'cuartos') {
                    matchDiv.setAttribute('data-ref-source-2', 'octavos');
                    matchDiv.setAttribute('data-ref-index-2', refIndex);
                }
                else if (nombreFase === 'semis') {
                    matchDiv.setAttribute('data-ref-source-2', 'cuartos');
                    matchDiv.setAttribute('data-ref-index-2', refIndex);
                }
                else if (nombreFase === 'final') {
                    matchDiv.setAttribute('data-ref-source-2', 'semis');
                    matchDiv.setAttribute('data-ref-index-2', refIndex);
                }
            }
        }
        
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
            infoDiv.textContent = obtenerInfoPartidoReal(nombreFase, partidoIndex, index, totalFases);
        }
        
        matchDiv.appendChild(infoDiv);
        
        roundDiv.appendChild(matchDiv);
    });
    
    bracketDiv.appendChild(roundDiv);
}

// Función principal para dibujar todas las conexiones
function dibujarTodasLasConexiones() {
    // Limpiar conexiones existentes
    document.querySelectorAll('.conexion-partido').forEach(el => el.remove());
    
    // Conectar cada fase con la siguiente
    conectarFase('dieciseisavos', 'octavos');
    conectarFase('octavos', 'cuartos');
    conectarFase('cuartos', 'semis');
    conectarFase('semis', 'final');
}

// Función mejorada para conectar partidos entre dos fases
function conectarFase(faseOrigen, faseDestino) {
    const partidosDestino = document.querySelectorAll(`.round[data-phase="${faseDestino}"] .match`);
    
    partidosDestino.forEach(partidoDestino => {
        // Buscar referencias explícitas a partidos de la fase anterior
        const refSource1 = partidoDestino.getAttribute('data-ref-source-1');
        const refIndex1 = partidoDestino.getAttribute('data-ref-index-1');
        const refSource2 = partidoDestino.getAttribute('data-ref-source-2');
        const refIndex2 = partidoDestino.getAttribute('data-ref-index-2');
        
        // Si hay referencia a la fase de origen, conectar
        if (refSource1 === faseOrigen && refIndex1 !== null) {
            const partidoOrigen = document.querySelector(`.round[data-phase="${faseOrigen}"] .match:nth-child(${parseInt(refIndex1) + 1})`);
            if (partidoOrigen) {
                conectarPartidos(partidoOrigen, partidoDestino, 'left');
            }
        }
        
        if (refSource2 === faseOrigen && refIndex2 !== null) {
            const partidoOrigen = document.querySelector(`.round[data-phase="${faseOrigen}"] .match:nth-child(${parseInt(refIndex2) + 1})`);
            if (partidoOrigen) {
                conectarPartidos(partidoOrigen, partidoDestino, 'right');
            }
        }
        
        // Método de respaldo: buscar por texto en caso de que los atributos data no estén disponibles
        if (!refSource1 && !refSource2) {
            const equipo1 = partidoDestino.querySelector('.team:first-child .team-name').textContent;
            const equipo2 = partidoDestino.querySelector('.team:last-child .team-name').textContent;
            
            // Verificar si hay referencia a un partido de la fase anterior
            if (equipo1.includes('Ganador P') || equipo2.includes('Ganador P')) {
                const refMatch1 = equipo1.match(/Ganador P(\d+)/);
                const refMatch2 = equipo2.match(/Ganador P(\d+)/);
                
                if (refMatch1) {
                    const partidoId = parseInt(refMatch1[1]) - 1;
                    const partidoOrigen = document.querySelector(`.round[data-phase="${faseOrigen}"] .match:nth-child(${partidoId + 1})`);
                    if (partidoOrigen) {
                        conectarPartidos(partidoOrigen, partidoDestino, 'left');
                    }
                }
                
                if (refMatch2) {
                    const partidoId = parseInt(refMatch2[1]) - 1;
                    const partidoOrigen = document.querySelector(`.round[data-phase="${faseOrigen}"] .match:nth-child(${partidoId + 1})`);
                    if (partidoOrigen) {
                        conectarPartidos(partidoOrigen, partidoDestino, 'right');
                    }
                }
            }
        }
    });
}

// Función para conectar dos partidos con una línea
function conectarPartidos(partidoOrigen, partidoDestino, lado = 'left') {
    const contenedor = partidoOrigen.closest('.bracket');
    const contenedorRect = contenedor.getBoundingClientRect();
    
    const origenRect = partidoOrigen.getBoundingClientRect();
    const destinoRect = partidoDestino.getBoundingClientRect();
    
    // Calcular posiciones relativas al contenedor
    const origenX = origenRect.right - contenedorRect.left;
    const origenY = origenRect.top + origenRect.height / 2 - contenedorRect.top;
    const destinoX = destinoRect.left - contenedorRect.left;
    const destinoY = destinoRect.top + destinoRect.height / 2 - contenedorRect.top;
    
    // Ajustar puntos de conexión según el lado
    const puntoOrigenX = lado === 'left' ? origenX : origenRect.left - contenedorRect.left + origenRect.width;
    const puntoDestinoX = lado === 'left' ? destinoX : destinoRect.left - contenedorRect.left;
    
    // Crear la línea conectiva
    const linea = document.createElement('div');
    linea.className = 'conexion-partido';
    
    // Calcular dimensiones y posición de la línea
    const width = Math.abs(puntoDestinoX - puntoOrigenX);
    const height = Math.abs(destinoY - origenY);
    const top = Math.min(origenY, destinoY);
    const left = Math.min(puntoOrigenX, puntoDestinoX);
    
    // Establecer estilos para la línea
    linea.style.position = 'absolute';
    linea.style.top = `${top}px`;
    linea.style.left = `${left}px`;
    linea.style.width = `${width}px`;
    linea.style.height = `${height}px`;
    linea.style.zIndex = '1';
    linea.style.pointerEvents = 'none';
    
    // Determinar la dirección de la línea
    if (destinoY > origenY) {
        // Línea hacia abajo
        if (puntoDestinoX > puntoOrigenX) {
            // Diagonal hacia abajo y derecha
            linea.style.borderRight = '2px solid #3498db';
            linea.style.borderBottom = '2px solid #3498db';
            linea.style.borderBottomRightRadius = '10px';
        } else {
            // Diagonal hacia abajo y izquierda
            linea.style.borderLeft = '2px solid #3498db';
            linea.style.borderBottom = '2px solid #3498db';
            linea.style.borderBottomLeftRadius = '10px';
        }
    } else {
        // Línea hacia arriba
        if (puntoDestinoX > puntoOrigenX) {
            // Diagonal hacia arriba y derecha
            linea.style.borderRight = '2px solid #3498db';
            linea.style.borderTop = '2px solid #3498db';
            linea.style.borderTopRightRadius = '10px';
        } else {
            // Diagonal hacia arriba y izquierda
            linea.style.borderLeft = '2px solid #3498db';
            linea.style.borderTop = '2px solid #3498db';
            linea.style.borderTopLeftRadius = '10px';
        }
    }
    
    // Agregar la línea al contenedor del bracket
    contenedor.appendChild(linea);
}

// Resto de las funciones (sin cambios)
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
    teamName.textContent = nombreEquipo;
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

function obtenerIconoTipo(tipo) {
    switch(tipo) {
        case 'dieciseisavos': return 'fa-chess-pawn';
        case 'octavos': return 'fa-chess-knight';
        case 'cuartos': return 'fa-chess-bishop';
        case 'semis': return 'fa-chess-rook';
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

// Agregar estilos dinámicos para las conexiones
const style = document.createElement('style');
style.textContent = `
    .conexion-partido {
        position: absolute;
        z-index: 1;
        pointer-events: none;
    }

    .bracket {
        position: relative;
    }

    .match {
        position: relative;
        z-index: 2;
    }
`;
document.head.appendChild(style);