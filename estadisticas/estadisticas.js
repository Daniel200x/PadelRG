let torneoData = null;
let jugadoresData = [];
let resultadosPartidos = {};
let equiposPorPosicion = {};
let ganadoresPorRonda = {
    dieciseisavos: {},
    octavos: {},
    cuartos: {},
    semis: {},
    final: {}
};

// LISTA DE RUTAS JSON - AGREGA TUS RUTAS AQUÍ
const RUTAS_JSON = [
    { nombre: '8va Segundo Set', ruta: '../segundoSet/js/ediciones/tercerFecha/masculino/8va.json' },
    { nombre: '7ma Segundo Set', ruta: '../segundoSet/js/ediciones/tercerFecha/masculino/7ma.json' },
    { nombre: '6ta Segundo Set', ruta: '../segundoSet/js/ediciones/tercerFecha/masculino/6ta.json' },
    { nombre: '7ma Arena', ruta: '../arenas/js/ediciones/cuartaFecha/masculino/7ma.json' }
    // Agrega más rutas según necesites
];

let torneosCargados = [];
let torneoActual = null;

// Cargar automáticamente todos los JSON al iniciar
document.addEventListener('DOMContentLoaded', function() {
    crearSelectorTorneos();
    cargarTodosLosTorneos();
});

// Función para crear el selector de torneos
function crearSelectorTorneos() {
    const selectorDiv = document.getElementById('tournamentSelector');
    
    if (RUTAS_JSON.length === 0) {
        selectorDiv.innerHTML = '<p>No hay torneos configurados</p>';
        return;
    }

    selectorDiv.innerHTML = '<p><strong>Selecciona un torneo:</strong></p><div class="tournament-buttons"></div>';
    const buttonsContainer = selectorDiv.querySelector('.tournament-buttons');

    RUTAS_JSON.forEach((torneo, index) => {
        const button = document.createElement('button');
        button.className = 'tournament-btn';
        button.textContent = torneo.nombre;
        button.dataset.ruta = torneo.ruta;
        button.onclick = () => cargarTorneoEspecifico(torneo.ruta, torneo.nombre);
        buttonsContainer.appendChild(button);

        // Cargar el primer torneo por defecto
        if (index === 0) {
            setTimeout(() => {
                button.classList.add('active');
                cargarTorneoEspecifico(torneo.ruta, torneo.nombre);
            }, 100);
        }
    });
}

// Función para cargar todos los torneos
async function cargarTodosLosTorneos() {
    const statusDiv = document.getElementById('fileStatus');
    statusDiv.className = 'status loading';
    statusDiv.innerHTML = '🔄 Cargando todos los torneos...';

    torneosCargados = [];

    for (const torneo of RUTAS_JSON) {
        try {
            const response = await fetch(torneo.ruta);
            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
            
            const data = await response.json();
            torneosCargados.push({
                nombre: torneo.nombre,
                ruta: torneo.ruta,
                data: data
            });
            
            console.log(`✅ ${torneo.nombre} cargado correctamente`);
        } catch (error) {
            console.error(`❌ Error cargando ${torneo.nombre}:`, error);
        }
    }

    if (torneosCargados.length > 0) {
        statusDiv.className = 'status success';
        statusDiv.innerHTML = `✅ ${torneosCargados.length} torneo(s) cargado(s) correctamente`;
        
        // Procesar estadísticas combinadas
        procesarEstadisticasCombinadas();
        
        // CREAR BOTÓN DE EXPORTACIÓN
        crearBotonExportacion();
    } else {
        statusDiv.className = 'status error';
        statusDiv.innerHTML = '❌ No se pudieron cargar los torneos';
    }
}

// Función para cargar un torneo específico
function cargarTorneoEspecifico(ruta, nombre) {
    const statusDiv = document.getElementById('fileStatus');
    const buttons = document.querySelectorAll('.tournament-btn');
    
    // Remover clase activa de todos los botones
    buttons.forEach(btn => btn.classList.remove('active'));
    
    // Agregar clase activa al botón clickeado
    buttons.forEach(btn => {
        if (btn.dataset.ruta === ruta) {
            btn.classList.add('active');
        }
    });

    statusDiv.className = 'status loading';
    statusDiv.innerHTML = `🔄 Cargando ${nombre}...`;

    fetch(ruta)
        .then(response => {
            if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
            return response.json();
        })
        .then(data => {
            torneoData = data;
            torneoActual = nombre;
            
            statusDiv.className = 'status success';
            statusDiv.innerHTML = `✅ ${nombre} cargado: <strong>${torneoData.nombre || nombre}</strong>`;
            
            // Reiniciar datos
            resultadosPartidos = {};
            equiposPorPosicion = {};
            jugadoresData = [];
            ganadoresPorRonda = {
                dieciseisavos: {},
                octavos: {},
                cuartos: {},
                semis: {},
                final: {}
            };
            
            // Procesar datos y generar estadísticas
            procesarEstadisticas();
            
            // CREAR BOTÓN DE EXPORTACIÓN
            crearBotonExportacion();
        })
        .catch(error => {
            statusDiv.className = 'status error';
            statusDiv.innerHTML = `❌ Error al cargar ${nombre}: ${error.message}`;
            console.error('Error loading JSON:', error);
        });
}

// =============================================
// FUNCIONES DE NORMALIZACIÓN
// =============================================

// Función para normalizar nombres (elimina acentos, convierte a minúsculas, etc.)
function normalizarNombre(nombre) {
    return nombre
        .toLowerCase()
        .trim()
        .normalize("NFD") // Separa caracteres y diacríticos
        .replace(/[\u0300-\u036f]/g, "") // Elimina diacríticos
        .replace(/\s+/g, ' '); // Normaliza espacios
}

// =============================================
// FUNCIONES ORIGINALES DE PROCESAMIENTO
// =============================================

// Procesar estadísticas de jugadores (función original)
function procesarEstadisticas() {
    if (!torneoData) return;
    
    console.log('Iniciando procesamiento de estadísticas...');
    
    // 1. Extraer todos los jugadores únicos de los equipos
    const jugadoresSet = new Set();
    
    torneoData.grupos.forEach(grupo => {
        grupo.equipos.forEach(equipo => {
            // Separar jugadores si hay barra "/"
            if (equipo.nombre.includes('/')) {
                const jugadores = equipo.nombre.split('/').map(j => j.trim());
                jugadores.forEach(jugador => jugadoresSet.add(jugador));
            } else {
                jugadoresSet.add(equipo.nombre);
            }
        });
    });
    
    console.log('Jugadores encontrados:', Array.from(jugadoresSet));
    
    // 2. Inicializar datos para cada jugador
    jugadoresSet.forEach(jugador => {
        jugadoresData.push({
            nombre: jugador,
            partidos: [],
            torneos: [torneoActual || 'Torneo Actual'],
            estadisticas: {
                total: 0,
                ganados: 0,
                perdidos: 0,
                setsGanados: 0,
                setsPerdidos: 0,
                gamesGanados: 0,
                gamesPerdidos: 0
            }
        });
    });
    
    // 3. Procesar TODOS los partidos de grupos con resolución de referencias
    procesarPartidosGruposCompleto();
    
    // 4. Calcular clasificación CORRECTA de grupos
    calcularClasificacionGrupos();
    
    // 5. Procesar partidos de eliminatorias
    procesarPartidosEliminatorias();
    
    // 6. Actualizar filtro de jugadores
    actualizarFiltroJugadores();
    
    // 7. Mostrar estadísticas
    mostrarEstadisticas();
    
    console.log('Procesamiento completado. Estadísticas:', jugadoresData);
}

// Calcular clasificación CORRECTA de grupos después de procesar todos los partidos
function calcularClasificacionGrupos() {
    console.log('\n=== CALCULANDO CLASIFICACIÓN DE GRUPOS ===');
    
    torneoData.grupos.forEach(grupo => {
        console.log(`\n--- Grupo: ${grupo.nombre} ---`);
        
        // Reinicializar estadísticas
        grupo.equipos.forEach(equipo => {
            equipo.PJ = 0;
            equipo.PG = 0;
            equipo.SG = 0;
            equipo.SP = 0;
            equipo.GF = 0;
            equipo.GC = 0;
            equipo.difSets = 0;
            equipo.difGames = 0;
        });
        
        // Procesar TODOS los partidos del grupo (incluyendo llaves)
        grupo.partidos.forEach(partido => {
            if (!partido.resultado || partido.resultado === "A definir") return;
            
            let equipo1Nombre = partido.equipo1;
            let equipo2Nombre = partido.equipo2;
            
            // Resolver referencias si es necesario
            if (partido.equipo1.includes("Ganador Partido") || partido.equipo1.includes("Perdedor Partido")) {
                const numPartido = partido.equipo1.match(/\d+/)?.[0];
                if (numPartido) {
                    const claveRef = `${grupo.nombre}_Partido${numPartido}`;
                    if (resultadosPartidos[claveRef]) {
                        equipo1Nombre = partido.equipo1.includes("Ganador") ? 
                            resultadosPartidos[claveRef].ganador : resultadosPartidos[claveRef].perdedor;
                    }
                }
            }
            
            if (partido.equipo2.includes("Ganador Partido") || partido.equipo2.includes("Perdedor Partido")) {
                const numPartido = partido.equipo2.match(/\d+/)?.[0];
                if (numPartido) {
                    const claveRef = `${grupo.nombre}_Partido${numPartido}`;
                    if (resultadosPartidos[claveRef]) {
                        equipo2Nombre = partido.equipo2.includes("Ganador") ? 
                            resultadosPartidos[claveRef].ganador : resultadosPartidos[claveRef].perdedor;
                    }
                }
            }
            
            const equipo1 = grupo.equipos.find(e => e.nombre === equipo1Nombre);
            const equipo2 = grupo.equipos.find(e => e.nombre === equipo2Nombre);
            
            if (!equipo1 || !equipo2) {
                console.log(`Equipos no encontrados: ${equipo1Nombre} o ${equipo2Nombre}`);
                return;
            }
            
            const [sets1, sets2] = partido.resultado.split('-').map(Number);
            const games = partido.games ? partido.games.split(', ').map(set => {
                const [g1, g2] = set.split('-').map(Number);
                return { g1, g2 };
            }) : [];
            
            // Actualizar estadísticas para clasificación
            equipo1.PJ++; equipo2.PJ++;
            equipo1.SG += sets1; equipo1.SP += sets2;
            equipo2.SG += sets2; equipo2.SP += sets1;
            
            const totalGames1 = games.reduce((sum, g) => sum + (g.g1 || 0), 0);
            const totalGames2 = games.reduce((sum, g) => sum + (g.g2 || 0), 0);
            equipo1.GF += totalGames1; equipo1.GC += totalGames2;
            equipo2.GF += totalGames2; equipo2.GC += totalGames1;
            
            if (sets1 > sets2) {
                equipo1.PG++;
            } else {
                equipo2.PG++;
            }
        });
        
        // Calcular diferencias
        grupo.equipos.forEach(equipo => {
            equipo.difSets = equipo.SG - equipo.SP;
            equipo.difGames = equipo.GF - equipo.GC;
        });
        
        // ORDENAR CORRECTAMENTE según criterios de tenis
        const clasificado = [...grupo.equipos].sort((a, b) => {
            // 1. Más partidos ganados
            if (a.PG !== b.PG) return b.PG - a.PG;
            
            // 2. Más sets ganados (diferencia de sets)
            if (a.difSets !== b.difSets) return b.difSets - a.difSets;
            
            // 3. Más games ganados (diferencia de games)
            if (a.difGames !== b.difGames) return b.difGames - a.difGames;
            
            // 4. Enfrentamiento directo (si aplica)
            const partidoDirecto = grupo.partidos.find(p => {
                const eq1 = (p.equipo1 === a.nombre || p.equipo1 === b.nombre);
                const eq2 = (p.equipo2 === a.nombre || p.equipo2 === b.nombre);
                return eq1 && eq2 && p.resultado && p.resultado !== "A definir";
            });
            
            if (partidoDirecto) {
                const [sets1, sets2] = partidoDirecto.resultado.split('-').map(Number);
                if (partidoDirecto.equipo1 === a.nombre) {
                    return sets1 > sets2 ? -1 : 1;
                } else {
                    return sets2 > sets1 ? -1 : 1;
                }
            }
            
            return 0;
        });
        
        console.log(`Clasificación ${grupo.nombre}:`);
        clasificado.forEach((equipo, index) => {
            console.log(`${index + 1}. ${equipo.nombre} | PG:${equipo.PG} | Sets:${equipo.SG}-${equipo.SP} (${equipo.difSets}) | Games:${equipo.GF}-${equipo.GC} (${equipo.difGames})`);
        });
        
        // Guardar equipos por posición CORRECTAMENTE
        const letraGrupo = grupo.nombre.split(' ')[1];
        clasificado.forEach((equipo, index) => {
            if (index < 2) {
                const posicion = index === 0 ? '1ro' : '2do';
                equiposPorPosicion[`${posicion} ${letraGrupo}`] = equipo.nombre;
                console.log(`${posicion} ${letraGrupo}: ${equipo.nombre}`);
            }
        });
    });
    
    console.log('Equipos por posición final:', equiposPorPosicion);
}

// Procesar TODOS los partidos de grupos con resolución de referencias
function procesarPartidosGruposCompleto() {
    console.log('\n=== PROCESANDO PARTIDOS DE GRUPOS ===');
    
    let cambios = true;
    let iteraciones = 0;
    
    while (cambios && iteraciones < 20) {
        cambios = false;
        iteraciones++;
        
        console.log(`\n--- Iteración ${iteraciones} ---`);
        
        torneoData.grupos.forEach(grupo => {
            grupo.partidos.forEach((partido, partidoIndex) => {
                if (!partido.resultado || partido.resultado === "A definir") return;
                
                const clavePartido = `${grupo.nombre}_Partido${partidoIndex + 1}`;
                if (resultadosPartidos[clavePartido]) {
                    return; // Ya procesado
                }
                
                let equipo1Nombre = partido.equipo1;
                let equipo2Nombre = partido.equipo2;
                let equiposResueltos = true;
                
                // Resolver referencias para equipo1
                if (partido.equipo1.includes("Ganador Partido") || partido.equipo1.includes("Perdedor Partido")) {
                    const numPartido = partido.equipo1.match(/\d+/)?.[0];
                    if (numPartido) {
                        const claveRef = `${grupo.nombre}_Partido${numPartido}`;
                        if (resultadosPartidos[claveRef]) {
                            equipo1Nombre = partido.equipo1.includes("Ganador") ? 
                                resultadosPartidos[claveRef].ganador : resultadosPartidos[claveRef].perdedor;
                        } else {
                            equiposResueltos = false;
                        }
                    }
                }
                
                // Resolver referencias para equipo2
                if (partido.equipo2.includes("Ganador Partido") || partido.equipo2.includes("Perdedor Partido")) {
                    const numPartido = partido.equipo2.match(/\d+/)?.[0];
                    if (numPartido) {
                        const claveRef = `${grupo.nombre}_Partido${numPartido}`;
                        if (resultadosPartidos[claveRef]) {
                            equipo2Nombre = partido.equipo2.includes("Ganador") ? 
                                resultadosPartidos[claveRef].ganador : resultadosPartidos[claveRef].perdedor;
                        } else {
                            equiposResueltos = false;
                        }
                    }
                }
                
                if (!equiposResueltos) {
                    return; // No podemos procesar todavía
                }
                
                // Procesar el partido con los nombres reales
                procesarPartido(partido, 'grupos', grupo.nombre, equipo1Nombre, equipo2Nombre);
                
                // Guardar resultado para referencias futuras
                const [sets1, sets2] = partido.resultado.split('-').map(Number);
                resultadosPartidos[clavePartido] = {
                    ganador: sets1 > sets2 ? equipo1Nombre : equipo2Nombre,
                    perdedor: sets1 > sets2 ? equipo2Nombre : equipo1Nombre
                };
                
                cambios = true;
            });
        });
    }
    
    console.log(`Procesamiento de grupos completado en ${iteraciones} iteraciones`);
}

// Función para resolver equipos en eliminatorias - VERSIÓN CORREGIDA
function resolverEquipoEliminatoria(equipoStr, rondaActual) {
    console.log(`Resolviendo equipo: "${equipoStr}" para ronda: ${rondaActual}`);
    
    // 1. Buscar en equipos por posición (1ro A, 2do B, etc.)
    if (equiposPorPosicion[equipoStr]) {
        console.log(`Encontrado en equiposPorPosicion: ${equiposPorPosicion[equipoStr]}`);
        return equiposPorPosicion[equipoStr];
    }
    
    // 2. Buscar en referencias de partidos de grupos
    if (equipoStr.includes("Ganador Partido") || equipoStr.includes("Perdedor Partido")) {
        const numPartido = equipoStr.match(/\d+/)?.[0];
        if (numPartido) {
            // Buscar en todos los grupos
            for (const grupo of torneoData.grupos) {
                const claveRef = `${grupo.nombre}_Partido${numPartido}`;
                if (resultadosPartidos[claveRef]) {
                    const resultado = equipoStr.includes("Ganador") ? 
                        resultadosPartidos[claveRef].ganador : resultadosPartidos[claveRef].perdedor;
                    console.log(`Encontrado en resultadosPartidos: ${resultado}`);
                    return resultado;
                }
            }
        }
    }
    
    // 3. Buscar en ganadores de rondas anteriores - LÓGICA CORREGIDA
    if (equipoStr.includes("Ganador P")) {
        const numPartido = equipoStr.match(/\d+/)?.[0];
        if (numPartido) {
            // LÓGICA ESPECÍFICA PARA CADA RONDA
            switch (rondaActual) {
                case 'dieciseisavos':
                    // En dieciseisavos solo puede referirse a grupos
                    break;
                    
                case 'octavos':
                    // En octavos busca en dieciseisavos
                    if (ganadoresPorRonda.dieciseisavos && ganadoresPorRonda.dieciseisavos[`Ganador P${numPartido}`]) {
                        return ganadoresPorRonda.dieciseisavos[`Ganador P${numPartido}`];
                    }
                    break;
                    
                case 'cuartos':
                    // En cuartos busca en octavos
                    if (ganadoresPorRonda.octavos && ganadoresPorRonda.octavos[`Ganador P${numPartido}`]) {
                        return ganadoresPorRonda.octavos[`Ganador P${numPartido}`];
                    }
                    break;
                    
                case 'semis':
                    // En semis busca en cuartos
                    if (ganadoresPorRonda.cuartos && ganadoresPorRonda.cuartos[`Ganador P${numPartido}`]) {
                        return ganadoresPorRonda.cuartos[`Ganador P${numPartido}`];
                    }
                    break;
                    
                case 'final':
                    // EN LA FINAL BUSCA EN SEMIS - ESTO ES LO QUE SE CORRIGE
                    // La final normalmente tiene referencias como "Ganador P1" y "Ganador P2" de semifinales
                    if (ganadoresPorRonda.semis) {
                        // Buscar en semis por el número de partido
                        if (ganadoresPorRonda.semis[`Ganador P${numPartido}`]) {
                            console.log(`Encontrado en semifinales: ${ganadoresPorRonda.semis[`Ganador P${numPartido}`]}`);
                            return ganadoresPorRonda.semis[`Ganador P${numPartido}`];
                        }
                        
                        // Si no encuentra por número específico, usar lógica por posición
                        // Normalmente en final: Ganador P1 = primer semifinal, Ganador P2 = segunda semifinal
                        if (numPartido === '1' && ganadoresPorRonda.semis['Ganador P1']) {
                            return ganadoresPorRonda.semis['Ganador P1'];
                        }
                        if (numPartido === '2' && ganadoresPorRonda.semis['Ganador P2']) {
                            return ganadoresPorRonda.semis['Ganador P2'];
                        }
                        if (numPartido === '3' && ganadoresPorRonda.semis['Ganador P3']) {
                            return ganadoresPorRonda.semis['Ganador P3'];
                        }
                        if (numPartido === '4' && ganadoresPorRonda.semis['Ganador P4']) {
                            return ganadoresPorRonda.semis['Ganador P4'];
                        }
                    }
                    break;
            }
        }
    }
    
    // 4. Si es la final y no se resolvió, intentar con lógica alternativa
    if (rondaActual === 'final') {
        console.log(`Intentando resolución alternativa para final: ${equipoStr}`);
        
        // Para la final, si no se pudo resolver, usar los ganadores de semifinales
        if (equipoStr.includes("Ganador P1") && ganadoresPorRonda.semis && ganadoresPorRonda.semis['Ganador P1']) {
            return ganadoresPorRonda.semis['Ganador P1'];
        }
        if (equipoStr.includes("Ganador P2") && ganadoresPorRonda.semis && ganadoresPorRonda.semis['Ganador P2']) {
            return ganadoresPorRonda.semis['Ganador P2'];
        }
        if (equipoStr.includes("Ganador P3") && ganadoresPorRonda.semis && ganadoresPorRonda.semis['Ganador P3']) {
            return ganadoresPorRonda.semis['Ganador P3'];
        }
        if (equipoStr.includes("Ganador P4") && ganadoresPorRonda.semis && ganadoresPorRonda.semis['Ganador P4']) {
            return ganadoresPorRonda.semis['Ganador P4'];
        }
    }
    
    console.log(`No se pudo resolver, usando original: ${equipoStr}`);
    return equipoStr;
}

// Procesar partidos de eliminatorias - VERSIÓN MEJORADA
function procesarPartidosEliminatorias() {
    console.log('\n=== PROCESANDO ELIMINATORIAS ===');
    
    // Definir el orden CORRECTO de procesamiento
    const fases = ['dieciseisavos', 'octavos', 'cuartos', 'semis', 'final'];
    
    fases.forEach(fase => {
        console.log(`\n--- Procesando ${fase} ---`);
        
        if (torneoData.eliminatorias && torneoData.eliminatorias[fase]) {
            if (Array.isArray(torneoData.eliminatorias[fase])) {
                console.log(`${fase} tiene ${torneoData.eliminatorias[fase].length} partidos`);
                
                torneoData.eliminatorias[fase].forEach((partido, index) => {
                    if (!partido.resultado || partido.resultado === "A definir") {
                        console.log(`Partido ${index + 1} sin resultado`);
                        return;
                    }
                    
                    let equipo1Resuelto = resolverEquipoEliminatoria(partido.equipo1, fase);
                    let equipo2Resuelto = resolverEquipoEliminatoria(partido.equipo2, fase);
                    
                    console.log(`Partido ${index + 1}: ${equipo1Resuelto} vs ${equipo2Resuelto}`);
                    
                    procesarPartido(partido, fase, '', equipo1Resuelto, equipo2Resuelto);
                    
                    // Guardar ganador para referencias futuras
                    const [sets1, sets2] = partido.resultado.split('-').map(Number);
                    const claveGanador = `Ganador P${index + 1}`;
                    ganadoresPorRonda[fase][claveGanador] = sets1 > sets2 ? equipo1Resuelto : equipo2Resuelto;
                    
                    console.log(`Ganador: ${ganadoresPorRonda[fase][claveGanador]} (guardado como ${claveGanador})`);
                    
                    // Para semifinales, también guardar referencia especial para la final
                    if (fase === 'semis') {
                        // En semifinales, normalmente P1 y P2 van a la final
                        if (index === 0) {
                            ganadoresPorRonda.semis['Finalista1'] = ganadoresPorRonda[fase][claveGanador];
                        } else if (index === 1) {
                            ganadoresPorRonda.semis['Finalista2'] = ganadoresPorRonda[fase][claveGanador];
                        }
                    }
                });
            } else {
                // Para la final que es un objeto
                const partido = torneoData.eliminatorias[fase];
                if (partido.resultado && partido.resultado !== "A definir") {
                    console.log(`Procesando FINAL como objeto individual`);
                    
                    let equipo1Resuelto = resolverEquipoEliminatoria(partido.equipo1, fase);
                    let equipo2Resuelto = resolverEquipoEliminatoria(partido.equipo2, fase);
                    
                    // VERIFICACIÓN EXTRA PARA LA FINAL
                    // Si no se pudieron resolver, usar los finalistas de semifinales
                    if (equipo1Resuelto.includes("Ganador P") && ganadoresPorRonda.semis && ganadoresPorRonda.semis['Finalista1']) {
                        console.log(`Usando Finalista1 para equipo1: ${ganadoresPorRonda.semis['Finalista1']}`);
                        equipo1Resuelto = ganadoresPorRonda.semis['Finalista1'];
                    }
                    if (equipo2Resuelto.includes("Ganador P") && ganadoresPorRonda.semis && ganadoresPorRonda.semis['Finalista2']) {
                        console.log(`Usando Finalista2 para equipo2: ${ganadoresPorRonda.semis['Finalista2']}`);
                        equipo2Resuelto = ganadoresPorRonda.semis['Finalista2'];
                    }
                    
                    console.log(`Final: ${equipo1Resuelto} vs ${equipo2Resuelto}`);
                    
                    procesarPartido(partido, fase, '', equipo1Resuelto, equipo2Resuelto);
                    
                    // Guardar ganadores de la final
                    const [sets1, sets2] = partido.resultado.split('-').map(Number);
                    ganadoresPorRonda.final.campeon = sets1 > sets2 ? equipo1Resuelto : equipo2Resuelto;
                    ganadoresPorRonda.final.subcampeon = sets1 > sets2 ? equipo2Resuelto : equipo1Resuelto;
                    
                    console.log(`Campeón: ${ganadoresPorRonda.final.campeon}`);
                    console.log(`Subcampeón: ${ganadoresPorRonda.final.subcampeon}`);
                }
            }
        } else {
            console.log(`No hay partidos en ${fase}`);
        }
    });
    
    console.log('Ganadores por ronda:', ganadoresPorRonda);
}

// Procesar un partido individual con nombres resueltos
function procesarPartido(partido, fase, grupo = '', equipo1Real, equipo2Real) {
    const [sets1, sets2] = partido.resultado.split('-').map(Number);
    const games = partido.games ? partido.games.split(', ').map(set => {
        const [g1, g2] = set.split('-').map(Number);
        return { g1, g2 };
    }) : [];
    
    // Calcular games totales
    const totalGames1 = games.reduce((sum, g) => sum + (g.g1 || 0), 0);
    const totalGames2 = games.reduce((sum, g) => sum + (g.g2 || 0), 0);
    
    console.log(`Procesando partido: ${equipo1Real} ${sets1}-${sets2} ${equipo2Real} (${fase})`);
    
    // Validar que los sets sean números válidos
    if (isNaN(sets1) || isNaN(sets2)) {
        console.error(`Error: Sets inválidos en partido: ${partido.resultado}`);
        return;
    }
    
    // Verificar si ya procesamos este partido para evitar duplicados
    const partidoKey = `${equipo1Real}_vs_${equipo2Real}_${fase}_${partido.resultado}`;
    if (resultadosPartidos[partidoKey]) {
        console.log(`Partido ya procesado: ${partidoKey}`);
        return;
    }
    resultadosPartidos[partidoKey] = true;
    
    // Procesar equipo 1
    procesarEquipoPartido(equipo1Real, {
        setsPropios: sets1,
        setsRival: sets2,
        gamesPropios: totalGames1,
        gamesRival: totalGames2,
        resultado: sets1 > sets2 ? 'ganado' : 'perdido',
        fase: fase,
        grupo: grupo,
        rival: equipo2Real,
        marcador: partido.resultado,
        torneo: torneoActual || 'Torneo Actual'
    });
    
    // Procesar equipo 2
    procesarEquipoPartido(equipo2Real, {
        setsPropios: sets2,
        setsRival: sets1,
        gamesPropios: totalGames2,
        gamesRival: totalGames1,
        resultado: sets2 > sets1 ? 'ganado' : 'perdido',
        fase: fase,
        grupo: grupo,
        rival: equipo1Real,
        marcador: partido.resultado,
        torneo: torneoActual || 'Torneo Actual'
    });
}

// Procesar un equipo en un partido
function procesarEquipoPartido(equipo, datosPartido) {
    // Buscar jugadores en este equipo
    let jugadores = [];
    
    if (equipo.includes('/')) {
        jugadores = equipo.split('/').map(j => j.trim());
    } else {
        jugadores = [equipo];
    }
    
    // Actualizar estadísticas para cada jugador
    jugadores.forEach(jugador => {
        const jugadorData = jugadoresData.find(j => j.nombre === jugador);
        if (jugadorData) {
            // Verificar si el partido ya existe para evitar duplicados
            const partidoExistente = jugadorData.partidos.find(p => 
                p.equipo === equipo && 
                p.rival === datosPartido.rival && 
                p.marcador === datosPartido.marcador &&
                p.fase === datosPartido.fase
            );
            
            if (partidoExistente) {
                return;
            }
            
            // Agregar partido
            jugadorData.partidos.push({
                equipo: equipo,
                rival: datosPartido.rival,
                marcador: datosPartido.marcador,
                resultado: datosPartido.resultado,
                fase: datosPartido.fase,
                grupo: datosPartido.grupo,
                torneo: datosPartido.torneo,
                setsPropios: datosPartido.setsPropios,
                setsRival: datosPartido.setsRival,
                gamesPropios: datosPartido.gamesPropios,
                gamesRival: datosPartido.gamesRival
            });
            
            // Actualizar estadísticas
            jugadorData.estadisticas.total++;
            
            if (datosPartido.resultado === 'ganado') {
                jugadorData.estadisticas.ganados++;
            } else {
                jugadorData.estadisticas.perdidos++;
            }
            
            jugadorData.estadisticas.setsGanados += datosPartido.setsPropios;
            jugadorData.estadisticas.setsPerdidos += datosPartido.setsRival;
            jugadorData.estadisticas.gamesGanados += datosPartido.gamesPropios;
            jugadorData.estadisticas.gamesPerdidos += datosPartido.gamesRival;
            
        }
    });
}

// =============================================
// FUNCIONES PARA MÚLTIPLES TORNEOS
// =============================================

// Función para procesar estadísticas combinadas de todos los torneos
function procesarEstadisticasCombinadas() {
    console.log('Procesando estadísticas combinadas de todos los torneos...');
    
    // Reiniciar datos
    jugadoresData = [];
    
    // Procesar cada torneo
    torneosCargados.forEach(torneo => {
        console.log(`Procesando: ${torneo.nombre}`);
        procesarUnTorneo(torneo.data, torneo.nombre);
    });
    
    // Mostrar debug
    mostrarDebugJugadores();
    
    // Actualizar interfaz
    actualizarFiltroJugadores();
    mostrarEstadisticasCombinadas();
}

// Función para procesar un torneo individual - VERSIÓN MEJORADA
function procesarUnTorneo(data, nombreTorneo) {
    // 1. Extraer todos los jugadores únicos de los equipos
    const jugadoresSet = new Set();
    
    data.grupos.forEach(grupo => {
        grupo.equipos.forEach(equipo => {
            if (equipo.nombre.includes('/')) {
                const jugadores = equipo.nombre.split('/').map(j => j.trim());
                jugadores.forEach(jugador => {
                    const jugadorNormalizado = normalizarNombre(jugador);
                    jugadoresSet.add(jugadorNormalizado);
                });
            } else {
                const jugadorNormalizado = normalizarNombre(equipo.nombre);
                jugadoresSet.add(jugadorNormalizado);
            }
        });
    });
    
    console.log(`Jugadores encontrados en ${nombreTorneo}:`, Array.from(jugadoresSet));
    
    // 2. Inicializar datos para cada jugador si no existe
    jugadoresSet.forEach(jugadorNormalizado => {
        // Buscar jugador existente (comparando en minúsculas)
        let jugadorExistente = jugadoresData.find(j => 
            normalizarNombre(j.nombre) === jugadorNormalizado
        );
        
        if (!jugadorExistente) {
            // Encontrar el nombre original del primer equipo donde aparece
            let nombreOriginal = jugadorNormalizado; // Valor por defecto
            
            // Buscar en todos los grupos y equipos
            data.grupos.forEach(grupo => {
                grupo.equipos.forEach(equipo => {
                    if (equipo.nombre.includes('/')) {
                        const jugadores = equipo.nombre.split('/').map(j => j.trim());
                        const jugadorEncontrado = jugadores.find(j => 
                            normalizarNombre(j) === jugadorNormalizado
                        );
                        if (jugadorEncontrado && nombreOriginal === jugadorNormalizado) {
                            nombreOriginal = jugadorEncontrado;
                        }
                    } else if (normalizarNombre(equipo.nombre) === jugadorNormalizado) {
                        if (nombreOriginal === jugadorNormalizado) {
                            nombreOriginal = equipo.nombre;
                        }
                    }
                });
            });
            
            // Asegurarse de que nombreOriginal tenga un valor válido
            if (!nombreOriginal || nombreOriginal === jugadorNormalizado) {
                // Si no encontramos un nombre original mejor, usar el normalizado pero con primera letra mayúscula
                nombreOriginal = jugadorNormalizado.charAt(0).toUpperCase() + jugadorNormalizado.slice(1);
            }
            
            jugadoresData.push({
                nombre: nombreOriginal, // CAMBIO: Usar nombreOriginal como identificador principal
                nombreNormalizado: jugadorNormalizado, // CAMBIO: Guardar normalizado por separado
                partidos: [],
                torneos: [],
                estadisticas: {
                    total: 0,
                    ganados: 0,
                    perdidos: 0,
                    setsGanados: 0,
                    setsPerdidos: 0,
                    gamesGanados: 0,
                    gamesPerdidos: 0
                }
            });
            jugadorExistente = jugadoresData[jugadoresData.length - 1];
            
            console.log(`Nuevo jugador creado: "${nombreOriginal}" (normalizado: "${jugadorNormalizado}")`);
        }
        
        // Agregar torneo si no existe
        if (!jugadorExistente.torneos.includes(nombreTorneo)) {
            jugadorExistente.torneos.push(nombreTorneo);
        }
    });
    
    // 3. Procesar partidos del torneo
    procesarPartidosTorneo(data, nombreTorneo);
}

// Función para procesar partidos de un torneo específico
function procesarPartidosTorneo(data, nombreTorneo) {
    // Procesar grupos
    data.grupos.forEach(grupo => {
        grupo.partidos.forEach(partido => {
            if (!partido.resultado || partido.resultado === "A definir") return;
            
            procesarPartidoIndividual(partido, 'grupos', grupo.nombre, nombreTorneo);
        });
    });
    
    // Procesar eliminatorias
    const fases = ['dieciseisavos', 'octavos', 'cuartos', 'semis', 'final'];
    fases.forEach(fase => {
        if (data.eliminatorias && data.eliminatorias[fase]) {
            if (Array.isArray(data.eliminatorias[fase])) {
                data.eliminatorias[fase].forEach(partido => {
                    if (!partido.resultado || partido.resultado === "A definir") return;
                    procesarPartidoIndividual(partido, fase, '', nombreTorneo);
                });
            } else {
                const partido = data.eliminatorias[fase];
                if (partido.resultado && partido.resultado !== "A definir") {
                    procesarPartidoIndividual(partido, fase, '', nombreTorneo);
                }
            }
        }
    });
}

// Función para procesar un partido individual
function procesarPartidoIndividual(partido, fase, grupo, nombreTorneo) {
    const [sets1, sets2] = partido.resultado.split('-').map(Number);
    const games = partido.games ? partido.games.split(', ').map(set => {
        const [g1, g2] = set.split('-').map(Number);
        return { g1, g2 };
    }) : [];
    
    const totalGames1 = games.reduce((sum, g) => sum + (g.g1 || 0), 0);
    const totalGames2 = games.reduce((sum, g) => sum + (g.g2 || 0), 0);
    
    // Procesar equipo 1
    procesarEquipoPartidoIndividual(partido.equipo1, {
        setsPropios: sets1,
        setsRival: sets2,
        gamesPropios: totalGames1,
        gamesRival: totalGames2,
        resultado: sets1 > sets2 ? 'ganado' : 'perdido',
        fase: fase,
        grupo: grupo,
        rival: partido.equipo2,
        marcador: partido.resultado,
        torneo: nombreTorneo
    });
    
    // Procesar equipo 2
    procesarEquipoPartidoIndividual(partido.equipo2, {
        setsPropios: sets2,
        setsRival: sets1,
        gamesPropios: totalGames2,
        gamesRival: totalGames1,
        resultado: sets2 > sets1 ? 'ganado' : 'perdido',
        fase: fase,
        grupo: grupo,
        rival: partido.equipo1,
        marcador: partido.resultado,
        torneo: nombreTorneo
    });
}

// Función para procesar un equipo en un partido individual
function procesarEquipoPartidoIndividual(equipo, datosPartido) {
    let jugadores = [];
    
    if (equipo.includes('/')) {
        jugadores = equipo.split('/').map(j => j.trim());
    } else {
        jugadores = [equipo];
    }
    
    jugadores.forEach(jugador => {
        const jugadorNormalizado = normalizarNombre(jugador);
        
        // Buscar jugador por nombre normalizado - CAMBIO: Buscar por nombreNormalizado
        const jugadorData = jugadoresData.find(j => 
            j.nombreNormalizado === jugadorNormalizado
        );
        
        if (jugadorData) {
            // Verificar si el partido ya existe para evitar duplicados
            const partidoExistente = jugadorData.partidos.find(p => 
                p.equipo === equipo && 
                p.rival === datosPartido.rival && 
                p.marcador === datosPartido.marcador &&
                p.fase === datosPartido.fase &&
                p.torneo === datosPartido.torneo
            );
            
            if (partidoExistente) return;
            
            // Agregar partido
            jugadorData.partidos.push({
                equipo: equipo,
                rival: datosPartido.rival,
                marcador: datosPartido.marcador,
                resultado: datosPartido.resultado,
                fase: datosPartido.fase,
                grupo: datosPartido.grupo,
                torneo: datosPartido.torneo,
                setsPropios: datosPartido.setsPropios,
                setsRival: datosPartido.setsRival,
                gamesPropios: datosPartido.gamesPropios,
                gamesRival: datosPartido.gamesRival
            });
            
            // Agregar torneo a la lista si no existe
            if (!jugadorData.torneos.includes(datosPartido.torneo)) {
                jugadorData.torneos.push(datosPartido.torneo);
            }
            
            // Actualizar estadísticas
            jugadorData.estadisticas.total++;
            
            if (datosPartido.resultado === 'ganado') {
                jugadorData.estadisticas.ganados++;
            } else {
                jugadorData.estadisticas.perdidos++;
            }
            
            jugadorData.estadisticas.setsGanados += datosPartido.setsPropios;
            jugadorData.estadisticas.setsPerdidos += datosPartido.setsRival;
            jugadorData.estadisticas.gamesGanados += datosPartido.gamesPropios;
            jugadorData.estadisticas.gamesPerdidos += datosPartido.gamesRival;
            
            console.log(`✅ Partido agregado para ${jugadorData.nombre} en ${datosPartido.torneo}: ${datosPartido.resultado}`);
        } else {
            console.warn(`⚠️ Jugador no encontrado: ${jugador} (buscado como: ${jugadorNormalizado})`);
            console.log('Jugadores disponibles:', jugadoresData.map(j => j.nombre));
        }
    });
}

// =============================================
// FUNCIONES DE INTERFAZ
// =============================================

// Actualizar filtro de jugadores - VERSIÓN CORREGIDA
function actualizarFiltroJugadores() {
    const playerFilter = document.getElementById('playerFilter');
    
    // Limpiar opciones existentes (excepto "Todos los jugadores")
    while (playerFilter.options.length > 1) {
        playerFilter.remove(1);
    }
    
    // Ordenar jugadores de manera segura - CAMBIO: Usar nombre en lugar de nombreOriginal
    const jugadoresOrdenados = [...jugadoresData].sort((a, b) => {
        const nombreA = (a.nombre || '').toString();
        const nombreB = (b.nombre || '').toString();
        return nombreA.localeCompare(nombreB);
    });
    
    // Agregar opciones al filtro - CAMBIO: Usar nombre en lugar de nombreOriginal
    jugadoresOrdenados.forEach(jugador => {
        const nombreMostrar = jugador.nombre || 'Jugador sin nombre';
        const option = document.createElement('option');
        option.value = nombreMostrar;
        option.textContent = nombreMostrar;
        playerFilter.appendChild(option);
    });
    
    console.log(`Filtro actualizado con ${jugadoresOrdenados.length} jugadores`);
}

// Mostrar estadísticas combinadas
function mostrarEstadisticasCombinadas() {
    const estadisticasDiv = document.getElementById('estadisticas');
    
    // Ordenar por porcentaje de victorias
    const jugadoresOrdenados = [...jugadoresData].sort((a, b) => {
        const porcentajeA = a.estadisticas.total > 0 ? 
            (a.estadisticas.ganados / a.estadisticas.total) * 100 : 0;
        const porcentajeB = b.estadisticas.total > 0 ? 
            (b.estadisticas.ganados / b.estadisticas.total) * 100 : 0;
        
        return porcentajeB - porcentajeA;
    });
    
    let html = '';
    
    if (jugadoresOrdenados.length === 0) {
        html = '<div class="status info">No hay datos para mostrar</div>';
    } else {
        jugadoresOrdenados.forEach(jugador => {
            html += generarTarjetaJugadorCombinada(jugador);
        });
    }
    
    estadisticasDiv.innerHTML = html;
}

// Generar tarjeta de estadísticas combinadas para un jugador - VERSIÓN MEJORADA
function generarTarjetaJugadorCombinada(jugador) {
    const stats = jugador.estadisticas;
    const porcentajeVictorias = stats.total > 0 ? 
        ((stats.ganados / stats.total) * 100).toFixed(1) : 0;
    
    // CAMBIO: Usar nombre directamente
    const nombreAMostrar = jugador.nombre || 'Jugador sin nombre';
    
    // Agrupar partidos por torneo
    const partidosPorTorneo = {};
    jugador.partidos.forEach(partido => {
        if (!partidosPorTorneo[partido.torneo]) {
            partidosPorTorneo[partido.torneo] = [];
        }
        partidosPorTorneo[partido.torneo].push(partido);
    });
    
    // Asegurarse de que torneos existe y es un array
    const torneosJugador = Array.isArray(jugador.torneos) ? jugador.torneos : [];
    
    return `
        <div class="jugador-card">
            <div class="jugador-header">
                <div>
                    <h2>${nombreAMostrar}</h2>
                    <div class="torneos-info">Participó en: ${torneosJugador.join(', ') || 'N/A'}</div>
                </div>
                <div>
                    <div class="stat-value">${porcentajeVictorias}%</div>
                    <div class="stat-label">Efectividad</div>
                </div>
            </div>
            
            <div class="jugador-stats">
                <div class="stat-item">
                    <div class="stat-value">${stats.total}</div>
                    <div class="stat-label">Partidos Totales</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${stats.ganados}</div>
                    <div class="stat-label">Victorias</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${stats.perdidos}</div>
                    <div class="stat-label">Derrotas</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${stats.setsGanados}-${stats.setsPerdidos}</div>
                    <div class="stat-label">Sets (G-P)</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${stats.gamesGanados}-${stats.gamesPerdidos}</div>
                    <div class="stat-label">Games (G-P)</div>
                </div>
            </div>
            
            <div style="padding: 20px;">
                <h3>Detalle de Partidos (${jugador.partidos.length} partidos)</h3>
                <table class="partidos-table">
                    <thead>
                        <tr>
                            <th>Torneo</th>
                            <th>Fase</th>
                            <th>Equipo</th>
                            <th>Rival</th>
                            <th>Resultado</th>
                            <th>Marcador</th>
                            <th>Sets</th>
                            <th>Games</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${jugador.partidos.map(partido => `
                            <tr>
                                <td><strong>${partido.torneo || 'N/A'}</strong></td>
                                <td><span class="fase-badge fase-${partido.fase}">${obtenerNombreFase(partido.fase)}</span></td>
                                <td>${partido.equipo || 'N/A'}</td>
                                <td>${partido.rival || 'N/A'}</td>
                                <td class="resultado-${partido.resultado}">${partido.resultado === 'ganado' ? '✅ Ganado' : '❌ Perdido'}</td>
                                <td>${partido.marcador || 'N/A'}</td>
                                <td>${partido.setsPropios || 0}-${partido.setsRival || 0}</td>
                                <td>${partido.gamesPropios || 0}-${partido.gamesRival || 0}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// Función para calcular estadísticas por torneo
function calcularEstadisticasTorneo(partidos) {
    return {
        total: partidos.length,
        ganados: partidos.filter(p => p.resultado === 'ganado').length,
        perdidos: partidos.filter(p => p.resultado === 'perdido').length,
        setsGanados: partidos.reduce((sum, p) => sum + p.setsPropios, 0),
        setsPerdidos: partidos.reduce((sum, p) => sum + p.setsRival, 0),
        gamesGanados: partidos.reduce((sum, p) => sum + p.gamesPropios, 0),
        gamesPerdidos: partidos.reduce((sum, p) => sum + p.gamesRival, 0)
    };
}

// Mostrar estadísticas (función original para torneo individual)
function mostrarEstadisticas() {
    const estadisticasDiv = document.getElementById('estadisticas');
    const jugadorFiltro = document.getElementById('playerFilter').value;
    const faseFiltro = document.getElementById('phaseFilter').value;
    
    let jugadoresAMostrar = jugadoresData;
    
    // Aplicar filtros
    if (jugadorFiltro !== 'all') {
        jugadoresAMostrar = jugadoresAMostrar.filter(j => j.nombre === jugadorFiltro);
    }
    
    // Ordenar por porcentaje de victorias
    jugadoresAMostrar.sort((a, b) => {
        const porcentajeA = a.estadisticas.total > 0 ? 
            (a.estadisticas.ganados / a.estadisticas.total) * 100 : 0;
        const porcentajeB = b.estadisticas.total > 0 ? 
            (b.estadisticas.ganados / b.estadisticas.total) * 100 : 0;
        
        return porcentajeB - porcentajeA;
    });
    
    let html = '';
    
    if (jugadoresAMostrar.length === 0) {
        html = '<div class="status info">No hay datos para mostrar con los filtros seleccionados</div>';
    } else {
        jugadoresAMostrar.forEach(jugador => {
            html += generarTarjetaJugadorIndividual(jugador, faseFiltro);
        });
    }
    
    estadisticasDiv.innerHTML = html;
}

// Generar tarjeta para torneo individual
function generarTarjetaJugadorIndividual(jugador, faseFiltro) {
    const stats = jugador.estadisticas;
    const porcentajeVictorias = stats.total > 0 ? 
        ((stats.ganados / stats.total) * 100).toFixed(1) : 0;
    
    // Filtrar partidos si es necesario
    let partidosAMostrar = jugador.partidos;
    if (faseFiltro !== 'all') {
        partidosAMostrar = partidosAMostrar.filter(p => p.fase === faseFiltro);
    }
    
    return `
        <div class="jugador-card">
            <div class="jugador-header">
                <div>
                    <h2>${jugador.nombre}</h2>
                </div>
                <div>
                    <div class="stat-value">${porcentajeVictorias}%</div>
                    <div class="stat-label">Efectividad</div>
                </div>
            </div>
            
            <div class="jugador-stats">
                <div class="stat-item">
                    <div class="stat-value">${stats.total}</div>
                    <div class="stat-label">Partidos</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${stats.ganados}</div>
                    <div class="stat-label">Victorias</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${stats.perdidos}</div>
                    <div class="stat-label">Derrotas</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${stats.setsGanados}-${stats.setsPerdidos}</div>
                    <div class="stat-label">Sets (G-P)</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${stats.gamesGanados}-${stats.gamesPerdidos}</div>
                    <div class="stat-label">Games (G-P)</div>
                </div>
            </div>
            
            ${partidosAMostrar.length > 0 ? `
                <div style="padding: 20px;">
                    <h3>Partidos Jugados (${partidosAMostrar.length})</h3>
                    <table class="partidos-table">
                        <thead>
                            <tr>
                                <th>Fase</th>
                                <th>Equipo</th>
                                <th>Rival</th>
                                <th>Resultado</th>
                                <th>Marcador</th>
                                <th>Sets</th>
                                <th>Games</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${partidosAMostrar.map(partido => `
                                <tr>
                                    <td><span class="fase-badge fase-${partido.fase}">${obtenerNombreFase(partido.fase)}</span></td>
                                    <td>${partido.equipo}</td>
                                    <td>${partido.rival}</td>
                                    <td class="resultado-${partido.resultado}">${partido.resultado === 'ganado' ? '✅ Ganado' : '❌ Perdido'}</td>
                                    <td>${partido.marcador}</td>
                                    <td>${partido.setsPropios}-${partido.setsRival}</td>
                                    <td>${partido.gamesPropios}-${partido.gamesRival}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            ` : '<div style="padding: 20px; text-align: center; color: #666;">No hay partidos para mostrar con los filtros seleccionados</div>'}
        </div>
    `;
}

// Obtener nombre legible de la fase
function obtenerNombreFase(fase) {
    const nombres = {
        'grupos': 'Grupos',
        'dieciseisavos': '16avos',
        'octavos': 'Octavos',
        'cuartos': 'Cuartos',
        'semis': 'Semis',
        'final': 'Final'
    };
    return nombres[fase] || fase;
}

// =============================================
// FUNCIONES DE DEBUG
// =============================================

// Función para debug - mostrar información de jugadores duplicados
function mostrarDebugJugadores() {
    console.log('=== DEBUG JUGADORES ===');
    jugadoresData.forEach(jugador => {
        console.log(`Jugador: "${jugador.nombreOriginal}" (normalizado: "${jugador.nombre}")`);
        console.log(`- Torneos: ${jugador.torneos.join(', ')}`);
        console.log(`- Partidos: ${jugador.partidos.length}`);
        console.log(`- Estadísticas: ${jugador.estadisticas.ganados}G ${jugador.estadisticas.perdidos}P`);
    });
}

// Función para buscar jugador en todos los torneos (para debug)
function buscarJugadorEnTodosTorneos(nombreJugador) {
    console.log(`=== BUSCANDO JUGADOR: ${nombreJugador} ===`);
    
    torneosCargados.forEach(torneo => {
        console.log(`\nEn torneo: ${torneo.nombre}`);
        let encontrado = false;
        
        torneo.data.grupos.forEach(grupo => {
            grupo.equipos.forEach(equipo => {
                if (equipo.nombre.includes(nombreJugador)) {
                    console.log(`✅ Encontrado en equipo: ${equipo.nombre}`);
                    encontrado = true;
                }
                if (equipo.nombre.includes('/')) {
                    const jugadores = equipo.nombre.split('/').map(j => j.trim());
                    if (jugadores.some(j => j.includes(nombreJugador))) {
                        console.log(`✅ Encontrado en equipo: ${equipo.nombre}`);
                        encontrado = true;
                    }
                }
            });
        });
        
        if (!encontrado) {
            console.log(`❌ No encontrado en ${torneo.nombre}`);
        }
    });
}

// =============================================
// FUNCIONES DE EXPORTACIÓN JSON
// =============================================

// Función para exportar estadísticas a JSON
function exportarAJSON() {
    console.log('Exportando datos a JSON...');
    
    // Preparar datos para exportación
    const datosExportacion = {
        fechaExportacion: new Date().toISOString(),
        totalJugadores: jugadoresData.length,
        torneosIncluidos: torneosCargados.map(t => t.nombre),
        jugadores: jugadoresData.map(jugador => ({
            nombre: jugador.nombre,
            nombreNormalizado: jugador.nombreNormalizado || normalizarNombre(jugador.nombre),
            torneos: jugador.torneos,
            estadisticas: {
                ...jugador.estadisticas,
                porcentajeVictorias: jugador.estadisticas.total > 0 ? 
                    parseFloat(((jugador.estadisticas.ganados / jugador.estadisticas.total) * 100).toFixed(1)) : 0,
                diferenciaSets: jugador.estadisticas.setsGanados - jugador.estadisticas.setsPerdidos,
                diferenciaGames: jugador.estadisticas.gamesGanados - jugador.estadisticas.gamesPerdidos
            },
            partidos: jugador.partidos.map(partido => ({
                torneo: partido.torneo,
                fase: partido.fase,
                grupo: partido.grupo,
                equipo: partido.equipo,
                rival: partido.rival,
                resultado: partido.resultado,
                marcador: partido.marcador,
                setsPropios: partido.setsPropios,
                setsRival: partido.setsRival,
                gamesPropios: partido.gamesPropios,
                gamesRival: partido.gamesRival,
                fechaPartido: partido.fecha || 'N/A'
            }))
        }))
    };

    // Convertir a JSON con formato legible
    const jsonString = JSON.stringify(datosExportacion, null, 2);
    
    // Crear y descargar archivo
    descargarJSON(jsonString, 'estadisticas_jugadores.json');
    
    // Mostrar mensaje de confirmación
    mostrarMensajeExportacion();
}

// Función para descargar el archivo JSON
function descargarJSON(contenido, nombreArchivo) {
    const blob = new Blob([contenido], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = nombreArchivo;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Liberar memoria
    setTimeout(() => URL.revokeObjectURL(url), 100);
}

// Función para mostrar mensaje de exportación
function mostrarMensajeExportacion() {
    const statusDiv = document.getElementById('fileStatus');
    const mensajeOriginal = statusDiv.innerHTML;
    
    statusDiv.className = 'status success';
    statusDiv.innerHTML = '✅ Datos exportados correctamente como JSON';
    
    // Restaurar mensaje original después de 3 segundos
    setTimeout(() => {
        if (torneosCargados.length > 0) {
            statusDiv.className = 'status success';
            statusDiv.innerHTML = `✅ ${torneosCargados.length} torneo(s) cargado(s) correctamente`;
        }
    }, 3000);
}

// Función para crear botón de exportación
function crearBotonExportacion() {
    const selectorDiv = document.getElementById('tournamentSelector');
    
    // Verificar si el botón ya existe
    if (document.getElementById('btnExportarJSON')) {
        return;
    }
    
    const botonExportar = document.createElement('button');
    botonExportar.id = 'btnExportarJSON';
    botonExportar.className = 'tournament-btn';
    botonExportar.style.background = '#28a745';
    botonExportar.style.color = 'white';
    botonExportar.style.border = 'none';
    botonExportar.style.marginTop = '10px';
    botonExportar.innerHTML = '📊 Exportar JSON';
    botonExportar.onclick = exportarAJSON;
    
    // Agregar tooltip
    botonExportar.title = 'Exportar todas las estadísticas a archivo JSON';
    
    selectorDiv.appendChild(botonExportar);
}

// Event listeners
document.getElementById('playerFilter').addEventListener('change', mostrarEstadisticas);
document.getElementById('phaseFilter').addEventListener('change', mostrarEstadisticas);