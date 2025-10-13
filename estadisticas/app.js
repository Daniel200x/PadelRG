// ==============================
// APLICACIÓN PRINCIPAL
// ==============================

// Elementos del DOM
const loadingIndicator = document.getElementById('loadingIndicator');
const playersGrid = document.getElementById('playersGrid');

// Datos cargados
let todosLosJugadores = [];

// Inicializar la aplicación cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    cargarTodasEstadisticas();
});

// Cargar todas las estadísticas automáticamente
async function cargarTodasEstadisticas() {
    try {
        const promesas = RUTAS_JSON.map(async (rutaInfo) => {
            try {
                const respuesta = await fetch(rutaInfo.ruta);
                if (!respuesta.ok) {
                    throw new Error(`Error ${respuesta.status} al cargar ${rutaInfo.nombre}`);
                }
                const datos = await respuesta.json();
                return { nombre: rutaInfo.nombre, datos: datos, ruta: rutaInfo.ruta };
            } catch (error) {
                console.error(`Error cargando ${rutaInfo.nombre}:`, error);
                return null;
            }
        });

        const resultados = await Promise.all(promesas);
        const archivosCargados = resultados.filter(result => result !== null);

        if (archivosCargados.length === 0) {
            throw new Error('No se pudo cargar ningún archivo JSON');
        }

        todosLosJugadores = combinarMultiplesStats(archivosCargados.map(a => a.datos));
        mostrarJugadores(todosLosJugadores);
        
    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
        mostrarError('Error al cargar las estadísticas: ' + error.message);
    }
}

// Combinar múltiples archivos
function combinarMultiplesStats(filesArray) {
    const playersMap = new Map();

    filesArray.forEach((fileData, fileIndex) => {
        if (fileData.jugadores && Array.isArray(fileData.jugadores)) {
            fileData.jugadores.forEach(jugador => {
                const playerKey = jugador.nombreNormalizado;
                
                if (!playersMap.has(playerKey)) {
                    playersMap.set(playerKey, {
                        nombre: jugador.nombre,
                        nombreNormalizado: jugador.nombreNormalizado,
                        torneos: new Set(),
                        estadisticasPorArchivo: [],
                        partidosTotales: []
                    });
                }

                const player = playersMap.get(playerKey);
                jugador.torneos.forEach(torneo => player.torneos.add(torneo));
                player.estadisticasPorArchivo.push({
                    estadisticas: { ...jugador.estadisticas }
                });
                player.partidosTotales.push(...jugador.partidos);
            });
        }
    });

    // Calcular estadísticas combinadas para cada jugador
    playersMap.forEach(player => {
        player.estadisticasCombinadas = calcularEstadisticasCombinadas(player.estadisticasPorArchivo);
        player.torneosLista = Array.from(player.torneos);
        player.foto = FOTOS_JUGADORES[player.nombreNormalizado] || FOTO_POR_DEFECTO;
    });

    return Array.from(playersMap.values());
}

// Calcular estadísticas combinadas
function calcularEstadisticasCombinadas(estadisticasPorArchivo) {
    let total = 0;
    let ganados = 0;
    let perdidos = 0;
    let setsGanados = 0;
    let setsPerdidos = 0;
    let gamesGanados = 0;
    let gamesPerdidos = 0;

    estadisticasPorArchivo.forEach(est => {
        total += est.estadisticas.total;
        ganados += est.estadisticas.ganados;
        perdidos += est.estadisticas.perdidos;
        setsGanados += est.estadisticas.setsGanados;
        setsPerdidos += est.estadisticas.setsPerdidos;
        gamesGanados += est.estadisticas.gamesGanados;
        gamesPerdidos += est.estadisticas.gamesPerdidos;
    });

    const porcentajeVictorias = total > 0 ? (ganados / total) * 100 : 0;

    return {
        total: total,
        ganados: ganados,
        perdidos: perdidos,
        setsGanados: setsGanados,
        setsPerdidos: setsPerdidos,
        gamesGanados: gamesGanados,
        gamesPerdidos: gamesPerdidos,
        porcentajeVictorias: Math.round(porcentajeVictorias * 10) / 10,
        diferenciaSets: setsGanados - setsPerdidos,
        diferenciaGames: gamesGanados - gamesPerdidos
    };
}

// Mostrar jugadores en el grid
function mostrarJugadores(jugadores) {
    loadingIndicator.style.display = 'none';
    playersGrid.style.display = 'grid';
    
    // Ordenar por porcentaje de victorias (descendente)
    jugadores.sort((a, b) => b.estadisticasCombinadas.porcentajeVictorias - a.estadisticasCombinadas.porcentajeVictorias);
    
    jugadores.forEach(jugador => {
        const card = crearTarjetaJugador(jugador);
        playersGrid.appendChild(card);
    });
}

// Crear tarjeta de jugador
function crearTarjetaJugador(jugador) {
    const card = document.createElement('div');
    card.className = 'player-card';
    
    card.innerHTML = `
        <div class="player-header">
            <img src="${jugador.foto}" alt="${jugador.nombre}" class="player-photo" 
                 onerror="this.src='${FOTO_POR_DEFECTO}'">
            <div class="player-info">
                <h3 class="player-name">${jugador.nombre}</h3>
                <div class="player-torneos">🏆 ${jugador.torneosLista.join(', ')}</div>
            </div>
            <div class="player-stats-badge">
                <div style="font-size: 22px; font-weight: bold;">
                    ${jugador.estadisticasCombinadas.porcentajeVictorias}%
                </div>
                <div style="font-size: 12px; opacity: 0.9;">Victorias</div>
            </div>
        </div>
        
        <div class="total-stats">
            <h4>📊 Estadísticas Totales</h4>
            <div class="stats-grid">
                <div class="stat-item">
                    <span class="stat-name">Partidos Totales:</span>
                    <span class="stat-value">${jugador.estadisticasCombinadas.total}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-name">Victorias-Derrotas:</span>
                    <span class="stat-value">${jugador.estadisticasCombinadas.ganados}-${jugador.estadisticasCombinadas.perdidos}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-name">% Victorias:</span>
                    <span class="stat-value ${getPercentageClass(jugador.estadisticasCombinadas.porcentajeVictorias)}">
                        ${jugador.estadisticasCombinadas.porcentajeVictorias}%
                    </span>
                </div>
                <div class="stat-item">
                    <span class="stat-name">Sets:</span>
                    <span class="stat-value">${jugador.estadisticasCombinadas.setsGanados}-${jugador.estadisticasCombinadas.setsPerdidos}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-name">Games:</span>
                    <span class="stat-value">${jugador.estadisticasCombinadas.gamesGanados}-${jugador.estadisticasCombinadas.gamesPerdidos}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-name">Diferencia Sets:</span>
                    <span class="stat-value ${jugador.estadisticasCombinadas.diferenciaSets >= 0 ? 'percentage-high' : 'percentage-low'}">
                        ${jugador.estadisticasCombinadas.diferenciaSets > 0 ? '+' : ''}${jugador.estadisticasCombinadas.diferenciaSets}
                    </span>
                </div>
                <div class="stat-item">
                    <span class="stat-name">Diferencia Games:</span>
                    <span class="stat-value ${jugador.estadisticasCombinadas.diferenciaGames >= 0 ? 'percentage-high' : 'percentage-low'}">
                        ${jugador.estadisticasCombinadas.diferenciaGames > 0 ? '+' : ''}${jugador.estadisticasCombinadas.diferenciaGames}
                    </span>
                </div>
            </div>
        </div>
    `;
    
    return card;
}

// Obtener clase CSS para el porcentaje
function getPercentageClass(percentage) {
    if (percentage >= 70) return 'percentage-high';
    if (percentage >= 50) return 'percentage-medium';
    return 'percentage-low';
}

// Mostrar error
function mostrarError(mensaje) {
    loadingIndicator.innerHTML = `
        <div style="color: #dc3545; background: rgba(220, 53, 69, 0.1); padding: 20px; border-radius: 10px; border: 1px solid #dc3545;">
            ❌ ${mensaje}
        </div>
    `;
}