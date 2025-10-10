document.addEventListener('DOMContentLoaded', function() {
    const matchDisplay = document.getElementById('matchDisplay');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const currentMatchSpan = document.getElementById('currentMatch');
    const totalMatchesSpan = document.getElementById('totalMatches');
    const progressBar = document.getElementById('progressBar');
    const countdownSpan = document.getElementById('countdown');
    
    let allMatches = [];
    let filteredMatches = [];
    let itemsDisplay = []; // Array que incluye partidos y publicidades
    let currentItemIndex = 0;
    let autoChangeInterval;
    let countdownInterval;
    let isPlaying = true;
    let countdownValue = 10;
    
    

    // Array de imágenes para las tarjetas laterales
    const sideCardImages = [
        
         '../img/publi/norte.png',
        '../img/publi/infinito.jpeg',
        '../img/publi/choperas.jpeg',
        '../img/publi/poseidon.jpeg',
        '../img/publi/trucha.png',
        '../img/publi/ibiza.jpeg',
        '../img/publi/andina.jpeg',
        '../img/publi/forza.jpeg',
         '../img/publi/norberta.jpg',
         '../img/publi/disena.jpeg',
        '../img/publi/otra.jpeg',
        '../img/publi/coiron.jpeg',


        '../img/promos/ultra.png',
        '../img/promos/thorne.gif',
        '../img/promos/kira.gif',
        '../img/promos/rpa.png',
        '../img/promos/pino.png',
        '../img/promos/fritz.gif',
        '../img/promos/trexx.gif',
        '../img/promos/coren.png',
        '../img/promos/rccars.gif',
        '../img/promos/fix.gif',

        '../img/publi/norte.png',
        '../img/publi/infinito.jpeg',
        '../img/publi/choperas.jpeg',
        '../img/publi/poseidon.jpeg',
        '../img/publi/trucha.png',
        '../img/publi/ibiza.jpeg',
        '../img/publi/andina.jpeg',
        '../img/publi/forza.jpeg',
        '../img/publi/norberta.jpg',
        '../img/publi/disena.jpeg',
        '../img/publi/otra.jpeg',
        '../img/publi/coiron.jpeg',
        
        
        

    ];

    // Función para actualizar las imágenes de las tarjetas laterales
    function updateSideCards() {
        const leftCardImage = document.getElementById('leftCardImage');
        const rightCardImage = document.getElementById('rightCardImage');
        
        console.log('Actualizando tarjetas laterales...');
        console.log('Elementos encontrados:', leftCardImage, rightCardImage);
       
     // IMAGEN FIJA PARA LA TARJETA IZQUIERDA
    const imagenFijaIzquierda = '../img/promos/padel.png'; // Cambia por la ruta de tu imagen fija    

    // Seleccionar imagen aleatoria solo para la derecha
    let randomRightIndex = Math.floor(Math.random() * sideCardImages.length);
    
    // Actualizar las imágenes
    if (leftCardImage) {
        leftCardImage.src = imagenFijaIzquierda;
        leftCardImage.alt = 'Promoción fija';
        console.log('Imagen izquierda FIJA asignada:', imagenFijaIzquierda);
    } else {
        console.error('No se encontró leftCardImage');
    }
    
    if (rightCardImage) {
        rightCardImage.src = sideCardImages[randomRightIndex];
        rightCardImage.alt = `Imagen lateral derecha ${randomRightIndex + 1}`;
        console.log('Imagen derecha asignada:', sideCardImages[randomRightIndex]);
    } else {
        console.error('No se encontró rightCardImage');
    }
}

    // Configurar event listeners para los botones de control
    prevBtn.addEventListener('click', showPreviousItem);
    nextBtn.addEventListener('click', showNextItem);
    playPauseBtn.addEventListener('click', togglePlayPause);
    
    // Cargar datos de los archivos JSON
    cargarDatosPartidos();
    
    // Inicializar tarjetas laterales después de un breve retraso
    setTimeout(() => {
        console.log('Inicializando tarjetas laterales...');
        updateSideCards();
        
        // Cambiar imágenes cada 30 segundos
        setInterval(updateSideCards, 10000);
    }, 1000);
    
    // Función para determinar qué día mostrar
    function obtenerDiaAMostrar() {
        const ahora = new Date();
        const horaActual = ahora.getHours();
        
        // Si es antes de las 7:00 AM, mostrar partidos del día anterior
        if (horaActual < 7) {
            const ayer = new Date(ahora);
            ayer.setDate(ahora.getDate() - 1);
            return ayer.getDay();
        } else {
            // Si es después de las 3:00 AM, mostrar partidos del día actual
            return ahora.getDay();
        }
    }
    
    // Función para convertir número de día (0-6) a nombre de día
    function numeroADia(numeroDia) {
        const dias = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
        return dias[numeroDia];
    }
    
    // Función para filtrar partidos por día
    function filtrarPartidosPorDia(partidos, dia) {
        return partidos.filter(partido => partido.dia === dia);
    }
    
    // Función para crear array de items con publicidades cada 5 partidos
   function crearItemsConPublicidad(partidos) {
    const items = [];
    
    partidos.forEach((partido, index) => {
        // Agregar solo el partido (sin publicidades)
        items.push({
            type: 'match',
            data: partido,
            originalIndex: index
        });
    });
    
    console.log(`Se crearon ${items.length} items (solo partidos)`);
    return items;
}

    
    function cargarDatosPartidos() {
        const archivosJSON = [
           // '../arenas/js/ediciones/cuartaFecha/femenino/4ta.json',
            '../arenas/js/ediciones/cuartaFecha/femenino/5ta.json',
            //'../arenas/js/ediciones/cuartaFecha/femenino/6ta.json',
            '../arenas/js/ediciones/cuartaFecha/femenino/7ma.json',
            //'../arenas/js/ediciones/cuartaFecha/femenino/8va.json',
            //'../arenas/js/ediciones/cuartaFecha/masculino/4ta.json',
            '../arenas/js/ediciones/cuartaFecha/masculino/5ta.json',
            //'../arenas/js/ediciones/cuartaFecha/masculino/6ta.json',
            '../arenas/js/ediciones/cuartaFecha/masculino/7ma.json',
            //'../arenas/js/ediciones/cuartaFecha/masculino/8va.json'
        ];
        
        const promesasCarga = archivosJSON.map(archivo => {
            return fetch(archivo)
                .then(response => {
                    if (!response.ok) throw new Error(`Error al cargar ${archivo}: ${response.status}`);
                    return response.json();
                })
                .then(data => {
                    console.log(`Procesando archivo: ${archivo}`);
                    console.log(`Nombre de categoría en JSON: ${data.nombre}`);
                    
                    return procesarPartidosCategoria(data, archivo);
                })
                .catch(error => {
                    console.error(`Error cargando ${archivo}:`, error);
                    return [];
                });
        });

        Promise.all(promesasCarga)
            .then(arraysPartidos => {
                // Combinar todos los partidos en un solo array
                allMatches = arraysPartidos.flat();
                
                console.log('Todos los partidos cargados:', allMatches);
                
                // Ordenar partidos por día de la semana (Lunes a Domingo) y luego por horario
                allMatches.sort((a, b) => {
                    // Primero ordenar por día de la semana
                    const ordenDias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
                    const diaA = a.dia || "Por definir";
                    const diaB = b.dia || "Por definir";
                    
                    const indiceA = ordenDias.indexOf(diaA);
                    const indiceB = ordenDias.indexOf(diaB);
                    
                    // Si ambos tienen día definido y son diferentes
                    if (indiceA !== -1 && indiceB !== -1 && indiceA !== indiceB) {
                        return indiceA - indiceB;
                    }
                    
                    // Si es el mismo día o uno no tiene día, ordenar por horario
                    if (a.horario === "00:00" || a.horario === "Por definir") return 1;
                    if (b.horario === "00:00" || b.horario === "Por definir") return -1;
                    return a.horario.localeCompare(b.horario);
                });
                
                // Filtrar partidos por el día correspondiente
                const diaNumero = obtenerDiaAMostrar();
                const diaNombre = numeroADia(diaNumero);
                filteredMatches = filtrarPartidosPorDia(allMatches, diaNombre);
                
                console.log(`Mostrando partidos del día: ${diaNombre}`);
                console.log(`Partidos filtrados:`, filteredMatches);
console.log(`Publicidades deshabilitadas en tarjeta central`);                
                // Crear array de items con publicidades
                itemsDisplay = crearItemsConPublicidad(filteredMatches);
                
                console.log('Items con publicidades:', itemsDisplay);
                
                // Actualizar contador total (solo partidos reales para el progreso)
                totalMatchesSpan.textContent = filteredMatches.length;
                
                if (itemsDisplay.length > 0) {
                    // Mostrar el primer item
                    showItem(currentItemIndex);
                    
                    // Iniciar cambio automático
                    startAutoChange();
                } else {
                    mostrarNoResultados(diaNombre);
                }
            })
            .catch(error => {
                console.error('Error inesperado:', error);
                mostrarError();
            });
    }
    
    function procesarPartidosCategoria(data, archivo) {
        const partidos = [];
        
        // Usar el nombre de la categoría directamente del JSON
        const nombreCategoria = data.nombre || "Categoría sin nombre";
        
        console.log(`Procesando categoría: ${nombreCategoria} del archivo: ${archivo}`);
        
        // Primero procesar los datos para actualizar ganadores/perdedores
        const dataProcesada = procesarDatosParaFixture(data, archivo);
        
        // Procesar partidos de grupos
        if (dataProcesada.grupos && Array.isArray(dataProcesada.grupos)) {
            dataProcesada.grupos.forEach(grupo => {
                if (grupo.partidos && Array.isArray(grupo.partidos)) {
                    grupo.partidos.forEach(partido => {
                        const fechaInfo = extraerInformacionFecha(partido.fecha);
                        const resultado = partido.games || "A definir";
                        
                        partidos.push({
                            categoria: nombreCategoria,
                            zona: grupo.nombre,
                            equipo1: partido.equipo1,
                            equipo2: partido.equipo2,
                            horario: fechaInfo.horario,
                            dia: fechaInfo.dia,
                            resultado: resultado,
                            estado: resultado !== "A definir" && resultado !== "-" ? "completed" : "pending",
                            fechaOriginal: partido.fecha
                        });
                    });
                }
            });
        }
        
        // Procesar partidos de eliminatorias
        if (dataProcesada.eliminatorias) {
            const fases = ['dieciseisavos', 'octavos', 'cuartos', 'semis', 'final'];
            
            fases.forEach(fase => {
                if (dataProcesada.eliminatorias[fase]) {
                    const partidosFase = Array.isArray(dataProcesada.eliminatorias[fase]) ? 
                        dataProcesada.eliminatorias[fase] : [dataProcesada.eliminatorias[fase]];
                        
                    partidosFase.forEach(partido => {
                        const fechaInfo = extraerInformacionFecha(partido.fecha);
                        const resultado = partido.games || "A definir";
                        const faseFormateada = formatearNombreFase(fase);
                        
                        partidos.push({
                            categoria: nombreCategoria,
                            zona: faseFormateada,
                            equipo1: partido.equipo1,
                            equipo2: partido.equipo2,
                            horario: fechaInfo.horario,
                            dia: fechaInfo.dia,
                            resultado: resultado,
                            estado: resultado !== "A definir" && resultado !== "-" ? "completed" : "pending",
                            fechaOriginal: partido.fecha
                        });
                    });
                }
            });
        }
        
        console.log(`Partidos encontrados en ${nombreCategoria}:`, partidos.length);
        return partidos;
    }

    // FUNCIONES COPIADAS DESDE fixture-del-dia-segundo.js PARA PROCESAR LOS DATOS
    function procesarDatosParaFixture(categoriaData, categoriaKey) {
        // Hacer copia profunda para no modificar los datos originales
        const data = JSON.parse(JSON.stringify(categoriaData));
        
        // 1. Actualizar resultados de grupos
        if (data.grupos) {
            actualizarResultadosGrupos(data.grupos);
            
            // 2. Calcular estadísticas
            data.grupos.forEach(grupo => {
                calcularEstadisticas(grupo);
            });
            
            // 3. Determinar clasificados y actualizar eliminatorias
            if (data.eliminatorias) {
                const clasificados = determinarClasificados(data.grupos);
                actualizarEliminatorias(data.eliminatorias, clasificados);
            }
        }
        
        return data;
    }

    function actualizarResultadosGrupos(grupos) {
        grupos.forEach(grupo => {
            // Mapear resultados de TODOS los partidos, no solo los primeros 2
            const resultadosPartidos = {};
            
            // Procesar TODOS los partidos del grupo
            grupo.partidos.forEach((partido, index) => {
                if (partido.resultado && partido.resultado !== '-' && partido.resultado !== 'A definir') {
                    const [sets1, sets2] = partido.resultado.split('-').map(Number);
                    
                    if (sets1 > sets2) {
                        resultadosPartidos[`Ganador Partido ${index+1}`] = partido.equipo1;
                        resultadosPartidos[`Perdedor Partido ${index+1}`] = partido.equipo2;
                    } else {
                        resultadosPartidos[`Ganador Partido ${index+1}`] = partido.equipo2;
                        resultadosPartidos[`Perdedor Partido ${index+1}`] = partido.equipo1;
                    }
                }
            });
            
            // Actualizar los partidos posteriores con los resultados
            grupo.partidos.forEach(partido => {
                if (partido.equipo1 && partido.equipo2) {
                    // Reemplazar en equipo1
                    for (const [key, value] of Object.entries(resultadosPartidos)) {
                        if (partido.equipo1.includes(key)) {
                            partido.equipo1 = value;
                        }
                    }
                    
                    // Reemplazar en equipo2
                    for (const [key, value] of Object.entries(resultadosPartidos)) {
                        if (partido.equipo2.includes(key)) {
                            partido.equipo2 = value;
                        }
                    }
                }
            });
        });
    }

    function calcularEstadisticas(grupo) {
        // Reiniciar estadísticas
        grupo.equipos.forEach(equipo => {
            equipo.PJ = 0;
            equipo.PG = 0;
            equipo.SG = 0;
            equipo.SP = 0;
            equipo.GF = 0;
            equipo.GC = 0;
        });

        // Procesar cada partido
        grupo.partidos.forEach(partido => {
            if (!partido.resultado || partido.resultado === '-') return;

            const [sets1, sets2] = partido.resultado.split('-').map(Number);
            const equipo1 = grupo.equipos.find(e => e.nombre === partido.equipo1);
            const equipo2 = grupo.equipos.find(e => e.nombre === partido.equipo2);

            if (!equipo1 || !equipo2) return;

            // Actualizar partidos jugados
            equipo1.PJ++;
            equipo2.PJ++;

            // Actualizar sets ganados/perdidos
            equipo1.SG += sets1;
            equipo1.SP += sets2;
            equipo2.SG += sets2;
            equipo2.SP += sets1;

            // Determinar ganador del partido
            if (sets1 > sets2) {
                equipo1.PG++;
            } else {
                equipo2.PG++;
            }

            // Si hay información de games por set
            if (partido.games) {
                const setsGames = partido.games.split(',');
                let games1 = 0, games2 = 0;
                
                setsGames.forEach(set => {
                    const [g1, g2] = set.split('-').map(Number);
                    games1 += g1;
                    games2 += g2;
                });
                
                equipo1.GF += games1;
                equipo1.GC += games2;
                equipo2.GF += games2;
                equipo2.GC += games1;
            }
        });
    }

    function determinarClasificados(grupos) {
        const clasificados = {};
        
        grupos.forEach(grupo => {
            // Ordenar equipos del grupo según su posición
            const equiposOrdenados = grupo.equipos.sort((a, b) => {
                if (b.PG !== a.PG) return b.PG - a.PG;
                const dsA = a.SG - a.SP;
                const dsB = b.SG - b.SP;
                if (dsB !== dsA) return dsB - dsA;
                return (b.GF - b.GC) - (a.GF - a.GC);
            });
            
            // Guardar clasificados
            const grupoKey = grupo.nombre.split(' ')[1]; // Extrae "A", "B", etc.
            clasificados[`1ro ${grupoKey}`] = equiposOrdenados[0]?.nombre || '';
            clasificados[`2do ${grupoKey}`] = equiposOrdenados[1]?.nombre || '';
        });
        
        return clasificados;
    }

    function actualizarEliminatorias(eliminatorias, clasificados) {
        const reemplazarClasificacion = (texto) => {
            return texto.replace(/(1ro|2do)\s([A-Z])/g, (match, posicion, grupo) => {
                return clasificados[`${posicion} ${grupo}`] || match;
            });
        };

        // Procesar 16vos si existen
        if (eliminatorias.dieciseisavos) {
            eliminatorias.dieciseisavos.forEach((partido, index) => {
                partido.equipo1 = reemplazarClasificacion(partido.equipo1);
                partido.equipo2 = reemplazarClasificacion(partido.equipo2);
                
                // Determinar ganador basado en games
                const ganadorIndex = determinarGanadorPorGames(partido.games);
                if (ganadorIndex) {
                    partido.ganador = ganadorIndex === 1 ? partido.equipo1 : partido.equipo2;
                    partido.resultado = partido.games; // Actualizar resultado con los games
                    
                    // Actualizar octavos
                    if (eliminatorias.octavos) {
                        eliminatorias.octavos.forEach(octavo => {
                            octavo.equipo1 = octavo.equipo1.replace(`Ganador P${index + 1}`, partido.ganador);
                            octavo.equipo2 = octavo.equipo2.replace(`Ganador P${index + 1}`, partido.ganador);
                        });
                    }
                }
            });
        }

        // Procesar octavos si existen
        if (eliminatorias.octavos) {
            eliminatorias.octavos.forEach((partido, index) => {
                partido.equipo1 = reemplazarClasificacion(partido.equipo1);
                partido.equipo2 = reemplazarClasificacion(partido.equipo2);
                
                // Determinar ganador basado en games
                const ganadorIndex = determinarGanadorPorGames(partido.games);
                if (ganadorIndex) {
                    partido.ganador = ganadorIndex === 1 ? partido.equipo1 : partido.equipo2;
                    partido.resultado = partido.games; // Actualizar resultado con los games
                    
                    // Actualizar cuartos
                    if (eliminatorias.cuartos) {
                        eliminatorias.cuartos.forEach(cuarto => {
                            cuarto.equipo1 = cuarto.equipo1.replace(`Ganador P${index + 1}`, partido.ganador);
                            cuarto.equipo2 = cuarto.equipo2.replace(`Ganador P${index + 1}`, partido.ganador);
                        });
                    }
                }
            });
        }
        
        // Procesar cuartos si existen
        if (eliminatorias.cuartos) {
            eliminatorias.cuartos.forEach((partido, index) => {
                partido.equipo1 = reemplazarClasificacion(partido.equipo1);
                partido.equipo2 = reemplazarClasificacion(partido.equipo2);
                
                // Determinar ganador basado en games
                const ganadorIndex = determinarGanadorPorGames(partido.games);
                if (ganadorIndex) {
                    partido.ganador = ganadorIndex === 1 ? partido.equipo1 : partido.equipo2;
                    partido.resultado = partido.games; // Actualizar resultado con los games
                    
                    // Actualizar semifinales
                    if (eliminatorias.semis) {
                        eliminatorias.semis.forEach(semi => {
                            semi.equipo1 = semi.equipo1.replace(`Ganador P${index + 1}`, partido.ganador);
                            semi.equipo2 = semi.equipo2.replace(`Ganador P${index + 1}`, partido.ganador);
                        });
                    }
                }
            });
        }

        // Procesar semifinales si existen
        if (eliminatorias.semis) {
            eliminatorias.semis.forEach((partido, index) => {
                partido.equipo1 = reemplazarClasificacion(partido.equipo1);
                partido.equipo2 = reemplazarClasificacion(partido.equipo2);
                
                const ganadorIndex = determinarGanadorPorGames(partido.games);
                if (ganadorIndex) {
                    partido.ganador = ganadorIndex === 1 ? partido.equipo1 : partido.equipo2;
                    partido.resultado = partido.games;
                    
                    // Actualizar final
                    if (eliminatorias.final) {
                        eliminatorias.final.equipo1 = eliminatorias.final.equipo1.replace(`Ganador P${index + 5}`, partido.ganador);
                        eliminatorias.final.equipo2 = eliminatorias.final.equipo2.replace(`Ganador P${index + 5}`, partido.ganador);
                    }
                }
            });
        }
        
        // Procesar final si existe
        if (eliminatorias.final) {
            eliminatorias.final.equipo1 = reemplazarClasificacion(eliminatorias.final.equipo1);
            eliminatorias.final.equipo2 = reemplazarClasificacion(eliminatorias.final.equipo2);
            
            const ganadorIndex = determinarGanadorPorGames(eliminatorias.final.games);
            if (ganadorIndex) {
                eliminatorias.final.ganador = ganadorIndex === 1 ? eliminatorias.final.equipo1 : eliminatorias.final.equipo2;
                eliminatorias.final.resultado = eliminatorias.final.games;
            }
        }
    }

    function determinarGanadorPorGames(games) {
        if (!games || games === "A definir") return null;
        
        const sets = games.split(',').map(set => {
            const [games1, games2] = set.trim().split('-').map(Number);
            return { games1, games2 };
        });
        
        let setsGanados1 = 0;
        let setsGanados2 = 0;
        
        sets.forEach(set => {
            if (set.games1 > set.games2) {
                setsGanados1++;
            } else {
                setsGanados2++;
            }
        });
        
        return setsGanados1 > setsGanados2 ? 1 : 2;
    }
    
    // FUNCIONES ORIGINALES DEL SCRIPT
    function extraerInformacionFecha(fechaStr) {
        if (!fechaStr || fechaStr === "A definir" || fechaStr === "Por definir") {
            return { dia: "Por definir", horario: "Por definir" };
        }
        
        // Lista de días en español (con y sin acentos)
        const diasSemana = [
            "Lunes", "Martes", "Miércoles", "Miercoles", 
            "Jueves", "Viernes", "Sábado", "Sabado", "Domingo"
        ];
        
        let diaEncontrado = "Por definir";
        let horario = "Por definir";
        
        // Buscar día en la cadena
        for (const dia of diasSemana) {
            if (fechaStr.toLowerCase().includes(dia.toLowerCase())) {
                diaEncontrado = dia;
                // Normalizar el nombre del día
                if (dia === "Miercoles") diaEncontrado = "Miércoles";
                if (dia === "Sabado") diaEncontrado = "Sábado";
                break;
            }
        }
        
        // Extraer horario (formato HH:MM)
        const horarioMatch = fechaStr.match(/\b\d{1,2}:\d{2}\b/);
        if (horarioMatch) {
            horario = horarioMatch[0];
        }
        
        return {
            dia: diaEncontrado,
            horario: horario,
        };
    }
    
    function formatearNombreFase(fase) {
        const nombres = {
            'dieciseisavos': '16vos de Final',
            'octavos': 'Octavos de Final', 
            'cuartos': 'Cuartos de Final',
            'semis': 'Semifinal',
            'final': 'Final'
        };
        return nombres[fase] || fase;
    }
    
    function showItem(index) {
        if (itemsDisplay.length === 0) return;
        
        const item = itemsDisplay[index];
        currentItemIndex = index;
        
        // Calcular el número real de partido (sin contar publicidades)
        const partidoRealIndex = calcularIndicePartidoReal(index);
        
        // Actualizar contador actual (solo partidos reales)
        currentMatchSpan.textContent = partidoRealIndex + 1;
        
        // Actualizar barra de progreso (solo partidos reales)
        progressBar.style.width = `${((partidoRealIndex + 1) / filteredMatches.length) * 100}%`;
        
        
            showMatch(item.data);
        
        
        // Reiniciar cuenta atrás
        resetCountdown();
    }
    
    function showMatch(partido) {
    // Determinar si el partido tiene resultado
    const tieneResultado = partido.estado === 'completed';
    const resultadoDisplay = tieneResultado ? partido.resultado : 'A JUGAR';
    
    // Formatear la información de fecha y hora para mostrar
    let infoTiempo = '';
    if (partido.dia !== "Por definir" && partido.horario !== "Por definir") {
        infoTiempo = `${partido.dia} - ${partido.horario}`;
    } else if (partido.dia !== "Por definir") {
        infoTiempo = partido.dia;
    } else if (partido.horario !== "Por definir") {
        infoTiempo = partido.horario;
    } else {
        infoTiempo = "Por definir";
    }
    
    // Obtener URLs de imágenes de los equipos
    const imagenEquipo1 = obtenerImagenEquipo(partido.equipo1);
    const imagenEquipo2 = obtenerImagenEquipo(partido.equipo2);

     // Texto adicional que quieres mostrar
    const textoAdicional = "Toda la info en    :    PADELRG.COM.AR   "; // Cambia este texto por el que necesites
    
    // Crear tarjeta de partido con imágenes
    matchDisplay.innerHTML = `
        <div class="match-card fade-in">
            <div class="match-header">
                <div class="match-category">${partido.categoria}</div>
                <div class="match-zone">${partido.zona}</div>
            </div>
            <!-- AGREGAR ESTA LÍNEA PARA EL TEXTO ADICIONAL -->
            <div class="match-subheader">
                ${textoAdicional}
            </div>
            <div class="match-body">
                <div class="teams-container">
                    <div class="team-with-image">
                        ${imagenEquipo1 ? 
                            `<img src="${imagenEquipo1}" alt="${partido.equipo1}" class="team-image" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik00MCAyMEM0My4zMTM3IDIwIDQ2IDIyLjY4NjMgNDYgMjZDNDYgMjkuMzEzNyA0My4zMTM3IDMyIDQwIDMyQzM2LjY4NjMgMzIgMzQgMjkuMzEzNyAzNCAyNkMzNCAyMi42ODYzIDM2LjY4NjMgMjAgNDAgMjBaTTQ4IDM2SDUyQzU2LjQyIDM2IDYwIDM5LjU4IDYwIDQ0VjUyQzYwIDUzLjEwNDYgNTkuMTA0NiA1NCA1OCA1NEgyMkMyMC44OTU0IDU0IDIwIDUzLjEwNDYgMjAgNTJWNDRDMjAgMzkuNTggMjMuNTggMzYgMjggMzZIMzJDMzIgMzMuNzkgMzMuNzkgMzIgMzYgMzJINDRDNDYuMjEgMzIgNDggMzMuNzkgNDggMzZaIiBmaWxsPSIjOEM4QzhDIi8+Cjwvc3ZnPgo=';">` : 
                            `<div class="team-image placeholder">
                                <i class="fas fa-users"></i>
                            </div>`
                        }
                        <div class="team-name">${partido.equipo1}</div>
                    </div>
                    <div class="vs">VS</div>
                    <div class="team-with-image">
                        ${imagenEquipo2 ? 
                            `<img src="${imagenEquipo2}" alt="${partido.equipo2}" class="team-image" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik00MCAyMEM0My4zMTM3IDIwIDQ2IDIyLjY4NjMgNDYgMjZDNDYgMjkuMzEzNyA0My4zMTM3IDMyIDQwIDMyQzM2LjY4NjMgMzIgMzQgMjkuMzEzNyAzNCAyNkMzNCAyMi42ODYzIDM2LjY4NjMgMjAgNDAgMjBaTTQ4IDM2SDUyQzU2LjQyIDM2IDYwIDM5LjU4IDYwIDQ0VjUyQzYwIDUzLjEwNDYgNTkuMTA0NiA1NCA1OCA1NEgyMkMyMC44OTU0IDU0IDIwIDUzLjEwNDYgMjAgNTJWNDRDMjAgMzkuNTggMjMuNTggMzYgMjggMzZIMzJDMzIgMzMuNzkgMzMuNzkgMzIgMzYgMzJINDRDNDYuMjEgMzIgNDggMzMuNzkgNDggMzZaIiBmaWxsPSIjOEM4QzhDIi8+Cjwvc3ZnPgo=';">` : 
                            `<div class="team-image placeholder">
                                <i class="fas fa-users"></i>
                            </div>`
                        }
                        <div class="team-name">${partido.equipo2}</div>
                    </div>
                </div>
                <div class="match-result ${partido.estado}">
                    ${resultadoDisplay}
                </div>
            </div>
            <div class="match-footer">
                <div class="match-time">
                    <i class="far fa-clock"></i>
                    ${infoTiempo}
                </div>
            </div>
        </div>
    `;
}

// Función para obtener la URL de la imagen del equipo
function obtenerImagenEquipo(nombreEquipo) {
    // Mapeo de nombres de equipos a URLs de imágenes
    const mapaImagenes = {
        // Ejemplos - reemplaza con tus equipos reales
        'Walter Rumi/Andres Agnes': '../img/equipos/walter-rumi-andres-agnes.jpg',
        'Matias Saldaño/Daniel Veliz': '../img/equipos/matias-saldano-daniel-veliz.jpg',
        'Jorge Vera/Walter Arrua': '../img/equipos/jorge-vera-walter-arrua.jpg',
        'Esteban Sanchez/Carlos Ozores': '../img/equipos/sanchez-ozores.jpg',
        'Oriana Martinez/Dana Martinez': '../img/equipos/omartinez-dmartinez.jpg',
        'Fernanda Retuerto/Daniela Bergondi': '../img/equipos/retuerto-bergondi.jpg',
        'Pablo Gomez/Bruno Sirgo': '../img/equipos/pgomez-bsirgo.jpg',
        'Lucas Fraile/Pedro Martinez': '../img/equipos/lfraile-pmartinez.jpg',
        'Emmanuel Bravo/Cristian Almaraz': '../img/equipos/ebravo-calmaraz.jpg',
        'Jose Muñoz/Juan Villanueva': '../img/equipos/jmunoz-jvillanueva.jpg',
        'Luciana Rodriguez/Mariana Pratto': '../img/equipos/lrodriguez-mpratto.jpg',
        'Agustina Quezada/Vanesa Iglesias': '../img/equipos/aquezada-viglesias.jpg',
        'Florencia Bianchi/Giuliana Gimenez': '../img/equipos/fbianchi-ggimenez.jpg',
        'Dario Chacon/Marcelo Trangoni': '../img/equipos/dchacon-mtrangoni.jpg',
        'Martin Pacheco/Cristian Perez': '../img/equipos/mpacheco-cperez.jpg',
        'Martin Spamer/Pablo Fiorotto': '../img/equipos/mspamer-pfiorotto.jpg',
        'Cecilia Gersicich/Carla Ortega': '../img/equipos/cgersi-cortega.jpg',
        'Gustavo Vera/Walter Carrizo': '../img/equipos/gustavo-vera-walter-carrizo.jpg',
        'Silvina Davalos/Karen Beamonte': '../img/equipos/sdavalos-kbeamonte.jpg',
        'Antonela Tarchini/Lorena Saldivia': '../img/equipos/atarchini-lsaldivia.jpg',
        'Martin Guaragna/Gabriel Gandolfi': '../img/equipos/mguaragna-ggandolfi.jpg',
        'Francisco Bordon/Benjamin Martinez': '../img/equipos/fbordon-bmartinez.jpg',
        'Mauro Olivera/Carlos Barrionuevo': '../img/equipos/molivera-cbarrionuevo.jpg',
        'Enrique Romero/Marcos Allende': '../img/equipos/eromero-mallende.jpg',
        'Ruben Pedraza/Martin Aguila': '../img/equipos/rpedraza-maguila.jpg',
        'Emilio Sanchez/Ruben Garin': '../img/equipos/esanchez-rgarin.jpg',
        'Franco Maero/Nicolas Gonzalez': '../img/equipos/fmaero-ngonzalez.jpg',
        'Braian Lizarraga/Federico Martinez': '../img/equipos/blizarraga-fmartinez.jpg',
        'Jorge Carabajal/Ignacio Carabajal/': '../img/equipos/jcarabajal-icarabajal.jpg',
        'Daniela Martinez/Alejandra Soto': '../img/equipos/dmartinez-asoto.jpg',
        'Antonella Domeneh/Griselda Gimenez': '../img/equipos/adomeneh-ggimenez.jpg',
        'Federico Bossio/Santiago David': '../img/equipos/fbossio-sdavid.jpg',
        'Dario Chacon/Marcelo Trangoni': '../img/equipos/dchacon-mtrangoni.jpg',
        'Pablo Gomez/Bruno Sirgo': '../img/equipos/pgomez-bsirgo.jpg',
        'Emilce Duca/Noelia Cagnelutti': '../img/equipos/educa-ncagne.jpg',
        'Ramiro Luna/Nicolas Gonzalez': '../img/equipos/rluna-ngonza.jpg',
        'Sabrina Morales/Rosalia Cruz': '../img/equipos/smorales-rcruz.jpg',
        'Natalia Politi/Estela Moyano': '../img/equipos/npoliti-emoyano.jpg',
        'Erika Martinez/Sandra Ackerman': '../img/equipos/emartinez-sacker.jpg',
        'Andrea Graneros/Florencia Graneros': '../img/equipos/agraneros-fgraneros.jpg',
        'Simon Barila/Nahuel Romero': '../img/equipos/sbarila-nromero.jpg',
        'Gonzalo Figueroa/Jesus Ferreyra': '../img/equipos/gfigueroa-jferreyra.jpg',
        'Juan Jose Rivero/Guillermo Farias': '../img/equipos/jjrivero-gfarias.jpg',
        'Viviana Nehue/Silvana Guerrero': '../img/equipos/vnehue-sguerrero.jpg',
        'Horacio Bucci/Jose Retamar': '../img/equipos/hbucci-jretamar.jpg',
        'Luciano Baroni/Gonzalo Muñoz': '../img/equipos/lbaroni-gmunoz.jpg',
        'Lesio Andreggiani/Santiago Olivera': '../img/equipos/cachito-solivera.jpg',
        'Fernando Mariani/Leonardo Cardozo': '../img/equipos/fmariani-lcardozo.jpg',
        'Mauro Olivera/Carlos Barrionuevo': '../img/equipos/molivera-cbarrio.jpg',
        'Enrique Romero/Marcos Allende': '../img/equipos/eromero-mallende.jpg',
        'Claudio Escobar/Julian Morales': '../img/equipos/cescobar-jmorales.jpg',
        'Silvina Vera/Lucila Saenz': '../img/equipos/svera-lsaenz.jpg',
        'Sebastian Rubio/Gustavo Santana': '../img/equipos/srubio-gsantana.jpg',
        'Pablo Alegre/Emmanuel Larocca': '../img/equipos/palegre-elarocca.jpg',
        'Karina Girollet/Lucia Ramirez': '../img/equipos/kgiro-lramirez.jpg',
        'Pamela Lirola/Victoria Visñuk': '../img/equipos/plirola-visnuk.jpg',
        'Javier Pereyra/Alexis Pereyra': '../img/equipos/jpereyra-apereyra.jpg',
        'Leandro Corrales/Luis Ruiz': '../img/equipos/-.jpg',
        'Gaston Tapia/Mario Roldan': '../img/equipos/-.jpg',
        'Miguel Lamas/Leandro Carracedo': '../img/equipos/-.jpg',
        'Macarena Oyarzun/Laura Gomez': '../img/equipos/-.jpg',
        'Emilse Molina/Iliana Luggren': '../img/equipos/-.jpg',
        'Violeta Lopez/Jimena Ramadori': '../img/equipos/volpez-jrama.jpg',
        'Soledad Silva/Ines Herrera': '../img/equipos/silva-herrera.jpg',
        'Ines Sosa/Paula Miranda': '../img/equipos/isosa-pmiranda.jpg',
        'Fernanda Martinez/Rocio Terrado': '../img/equipos/fmartinez-rterrado.jpg',
        'Cintia Lucero/Barbara Rigoni': '../img/equipos/clucero-brigoni.jpg',
        'Blas Sanchez/Jorge Ugarte': '../img/equipos/bsanchez-jugarte.jpg',
        'Antonella Zampini/Romina Castillo': '../img/equipos/azampini-rcastillo.jpg',
        '/': '../img/equipos/-.jpg',
        '/': '../img/equipos/-.jpg',
        '/': '../img/equipos/-.jpg',
        '/': '../img/equipos/-.jpg',
        '/': '../img/equipos/-.jpg',
        '/': '../img/equipos/-.jpg',
        '/': '../img/equipos/-.jpg',
        '/': '../img/equipos/-.jpg',
        '/': '../img/equipos/-.jpg',
        '/': '../img/equipos/-.jpg',
        '/': '../img/equipos/-.jpg',
        '/': '../img/equipos/-.jpg',
        '/': '../img/equipos/-.jpg',


        
        
        
        
        
        
        // Agrega más equipos según necesites
    };
    
    // Buscar coincidencia exacta
    if (mapaImagenes[nombreEquipo]) {
        return mapaImagenes[nombreEquipo];
    }
    
    // Buscar coincidencia parcial (útil si los nombres no son exactos)
    for (const [key, value] of Object.entries(mapaImagenes)) {
        if (nombreEquipo.includes(key) || key.includes(nombreEquipo)) {
            return value;
        }
    }
    
    // Si no se encuentra imagen, devolver null para mostrar placeholder
    return null;
}
  
    
    // Función para calcular el índice real del partido (sin publicidades)
    function calcularIndicePartidoReal(indexActual) {
        let partidosContados = 0;
        
        for (let i = 0; i <= indexActual; i++) {
            if (itemsDisplay[i].type === 'match') {
                partidosContados++;
            }
        }
        
        return partidosContados - 1; // Restar 1 porque los índices empiezan en 0
    }
    
    function showPreviousItem() {
        if (itemsDisplay.length === 0) return;
        
        currentItemIndex = (currentItemIndex - 1 + itemsDisplay.length) % itemsDisplay.length;
        showItem(currentItemIndex);
        resetCountdown();
    }
    
    function showNextItem() {
    if (itemsDisplay.length === 0) return;
    
    // Verificar si estamos en el último item
    if (currentItemIndex === itemsDisplay.length - 1) {
        // Llegamos al final, realizar refresco forzado
        console.log('Fin de los resultados. Realizando refresco forzado...');
        
        // Limpiar todos los intervalos antes de recargar
        if (autoChangeInterval) clearInterval(autoChangeInterval);
        if (countdownInterval) clearInterval(countdownInterval);
        
        // Mostrar mensaje de recarga
        matchDisplay.innerHTML = `
            <div class="reload-message fade-in">
                <i class="fas fa-sync-alt fa-spin"></i>
                <h3>Actualizando resultados...</h3>
                <p>Recargando para mostrar nuevos resultados disponibles.</p>
            </div>
        `;
        
        // Forzar recarga después de 3 segundos (para que se vea el mensaje)
        setTimeout(() => {
            // Recarga forzada (ignorando caché)
            location.reload(true);
        }, 3000);
        return;
    }
    
    currentItemIndex = (currentItemIndex + 1) % itemsDisplay.length;
    showItem(currentItemIndex);
    resetCountdown();
}
    
    function startAutoChange() {
        if (autoChangeInterval) clearInterval(autoChangeInterval);
        
        autoChangeInterval = setInterval(() => {
            if (isPlaying) {
                showNextItem();
            }
        }, 10000); // Cambiar cada 10 segundos
        
        // Iniciar cuenta atrás
        startCountdown();
    }
    
    function togglePlayPause() {
        isPlaying = !isPlaying;
        const icon = playPauseBtn.querySelector('i');
        
        if (isPlaying) {
            icon.className = 'fas fa-pause';
            startCountdown();
        } else {
            icon.className = 'fas fa-play';
            if (countdownInterval) clearInterval(countdownInterval);
        }
    }
    
    function startCountdown() {
        if (countdownInterval) clearInterval(countdownInterval);
        
        countdownValue = 10;
        updateCountdownDisplay();
        
        countdownInterval = setInterval(() => {
            countdownValue--;
            updateCountdownDisplay();
            
            if (countdownValue <= 0) {
                clearInterval(countdownInterval);
            }
        }, 1000);
    }
    
    function resetCountdown() {
        countdownValue = 10;
        updateCountdownDisplay();
        
        if (isPlaying) {
            startCountdown();
        }
    }
    
    function updateCountdownDisplay() {
        countdownSpan.textContent = countdownValue;
    }
    
    function mostrarNoResultados(dia) {
        matchDisplay.innerHTML = `
            <div class="no-results fade-in">
                <i class="far fa-calendar-times"></i>
                <h3>No hay partidos programados</h3>
                <p>No se encontraron partidos para el ${dia}.</p>
                <p>Por favor, verifica en otro día.</p>
            </div>
        `;
        
        // Ocultar controles cuando no hay resultados
        document.querySelector('.controls').style.display = 'none';
        document.querySelector('.progress-container').style.display = 'none';
    }
    
    function mostrarError() {
        matchDisplay.innerHTML = `
            <div class="error-message fade-in">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error al cargar los datos</h3>
                <p>No se pudieron cargar los resultados. Por favor, intenta más tarde.</p>
            </div>
        `;
    }

    
});

