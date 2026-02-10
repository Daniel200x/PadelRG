// Información básica de cada fecha del torneo
const edicionesInfo = {
    "primerFecha": {
        nombre: "1ra Fecha - Torneo Arenas 2025",
        fecha: "15-30 Marzo 2025",
        lugar: "Arena",
        descripcion: "Primera fecha 2025",
        path: "js/ediciones/primerFecha"
    },
    "segundaFecha": {
        nombre: "2da Fecha - Torneo Arenas 2025",
        fecha: "15-30 Junio 2025",
        lugar: "Arena",
        descripcion: "Segunda fecha 2025",
        path: "js/ediciones/segundaFecha"
    },
    "tercerFecha": {
        nombre: "3ra Fecha - Torneo Arenas 2025",
        fecha: "29/07 a 10/08 2025",
        lugar: "Arena",
        descripcion: "Tercera fecha 2025",
        path: "js/ediciones/tercerFecha"
    },
    "cuartaFecha": {
        nombre: "4ta Fecha - Torneo Arenas 2025",
        fecha: "07/10 a 19/10 2025",
        lugar: "Arena",
        descripcion: "Cuarta fecha 2025",
        path: "js/ediciones/cuartaFecha"
    },
    "provincial": {
        nombre: "Torneo Provincial 2025",
        fecha: "Noviembre 2025",
        lugar: "Sede Provincial",
        descripcion: "Torneo Provincial - Clasificatorio",
        path: "js/ediciones/provincial",
        tipo: "provincial"
    }
};

// Almacenamiento de datos cargados
const edicionesCargadas = {};

// Variables para controlar la selección actual
let edicionActual = null;
let generoActual = null;
let categoriaActual = null;

// Función para extraer día y hora de la fecha del partido
function extraerDiaYHora(fechaStr) {
    if (!fechaStr) return { dia: 'Sin fecha', hora: '00:00', orden: 9999 };
    
    const diasSemana = {
        'lunes': 1, 'martes': 2, 'miercoles': 3, 'miércoles': 3, 'jueves': 4,
        'viernes': 5, 'sabado': 6, 'sábado': 6, 'domingo': 7
    };
    
    const partes = fechaStr.toLowerCase().split(' ');
    let diaNum = 8; // Valor por defecto para fechas sin día reconocido
    let horaStr = '00:00';
    
    // Buscar el día en las primeras palabras
    for (let i = 0; i < Math.min(partes.length, 2); i++) {
        const palabra = partes[i].replace(',', '');
        if (diasSemana[palabra] !== undefined) {
            diaNum = diasSemana[palabra];
            break;
        }
    }
    
    // Buscar la hora (formato HH:MM)
    const horaMatch = fechaStr.match(/(\d{1,2}):(\d{2})/);
    if (horaMatch) {
        horaStr = `${horaMatch[1].padStart(2, '0')}:${horaMatch[2]}`;
    }
    
    return {
        dia: diaNum,
        hora: horaStr,
        orden: diaNum * 10000 + parseInt(horaStr.replace(':', ''))
    };
}

// Función para formatear el nombre del día
function formatearDia(diaNum) {
    const dias = {
        1: 'Lunes',
        2: 'Martes', 
        3: 'Miércoles',
        4: 'Jueves',
        5: 'Viernes',
        6: 'Sábado',
        7: 'Domingo',
        8: 'Sin fecha definida'
    };
    return dias[diaNum] || 'Sin fecha';
}

// Función auxiliar para obtener colores por día
function obtenerColorDia(diaNum) {
    const colores = {
        1: '#3498db', // Lunes - Azul
        2: '#9b59b6', // Martes - Púrpura
        3: '#2ecc71', // Miércoles - Verde
        4: '#f39c12', // Jueves - Naranja
        5: '#e74c3c', // Viernes - Rojo
        6: '#1abc9c', // Sábado - Turquesa
        7: '#d35400', // Domingo - Naranja oscuro
        8: '#7f8c8d'  // Sin fecha - Gris
    };
    return colores[diaNum] || '#7f8c8d';
}

// Función para determinar la etapa (RG o USH) basada en la ubicación del partido
function determinarEtapa(partido) {
    if (!partido.fecha) return 'USH'; // Por defecto
    
    const fechaStr = partido.fecha.toLowerCase();
    
    // Si menciona "Rio Grande" o "RG" es etapa RG
    if (fechaStr.includes('rio grande') || fechaStr.includes('rg') || fechaStr.includes('río grande')) {
        return 'RG';
    }
    // Si menciona "Ushuaia" o "USH" es etapa USH
    else if (fechaStr.includes('ushuaia') || fechaStr.includes('ush')) {
        return 'USH';
    }
    
    // Por defecto, basado en la cancha o información adicional
    return 'USH';
}

// Función para actualizar ganadores y perdedores en los partidos de grupo
function actualizarResultadosGrupos(grupos) {
    grupos.forEach(grupo => {
        // Mapear resultados de los primeros partidos
        const resultadosPrimerosPartidos = {};
        
        // Procesar los primeros 2 partidos de cada grupo
        for (let i = 0; i < 2 && i < grupo.partidos.length; i++) {
            const partido = grupo.partidos[i];
            
            if (partido.resultado && partido.resultado !== '-' && partido.resultado !== 'A definir') {
                const [sets1, sets2] = partido.resultado.split('-').map(Number);
                
                if (sets1 > sets2) {
                    resultadosPrimerosPartidos[`Ganador Partido ${i+1}`] = partido.equipo1;
                    resultadosPrimerosPartidos[`Perdedor Partido ${i+1}`] = partido.equipo2;
                } else {
                    resultadosPrimerosPartidos[`Ganador Partido ${i+1}`] = partido.equipo2;
                    resultadosPrimerosPartidos[`Perdedor Partido ${i+1}`] = partido.equipo1;
                }
            }
        }
        
        // Actualizar los partidos posteriores con los resultados
        grupo.partidos.forEach(partido => {
            if (partido.equipo1 && partido.equipo2) {
                // Reemplazar en equipo1
                for (const [key, value] of Object.entries(resultadosPrimerosPartidos)) {
                    if (partido.equipo1.includes(key)) {
                        partido.equipo1 = value;
                    }
                }
                
                // Reemplazar en equipo2
                for (const [key, value] of Object.entries(resultadosPrimerosPartidos)) {
                    if (partido.equipo2.includes(key)) {
                        partido.equipo2 = value;
                    }
                }
            }
        });
    });
}

// Función para calcular estadísticas basadas en resultados
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

// Función para calcular estadísticas específicas para el Torneo Provincial
function calcularEstadisticasProvincial(grupo) {
    // Reiniciar estadísticas
    grupo.equipos.forEach(equipo => {
        equipo.PJ = 0;
        equipo.PG = 0;
        equipo.SG = 0;
        equipo.SP = 0;
        equipo.GF = 0;
        equipo.GC = 0;
        equipo.Puntos = 0;
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
            
            // Sumar puntos para la ciudad correspondiente
            if (partido.sumaPuntos === 'ambos' || partido.sumaPuntos === 'equipo1') {
                equipo1.Puntos += 1;
            }
        } else {
            equipo2.PG++;
            
            // Sumar puntos para la ciudad correspondiente
            if (partido.sumaPuntos === 'ambos' || partido.sumaPuntos === 'equipo2') {
                equipo2.Puntos += 1;
            }
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

// Función para obtener los puntos totales por ciudad de todas las categorías
function obtenerPuntosTotalesPorCiudad(edicion) {
    const puntosTotales = {
        'Río Grande': 0,
        'Ushuaia': 0
    };
    
    // Procesar todas las categorías de ambos géneros
    Object.values(edicion.categorias).forEach(generoData => {
        Object.values(generoData).forEach(categoriaData => {
            if (categoriaData.grupos) {
                categoriaData.grupos.forEach(grupo => {
                    grupo.equipos.forEach(equipo => {
                        if (equipo.ciudad && equipo.Puntos) {
                            puntosTotales[equipo.ciudad] += equipo.Puntos;
                        }
                    });
                });
            }
        });
    });
    
    return puntosTotales;
}

// Función para obtener todos los partidos de todas las categorías ordenados por día y hora
function obtenerTodosLosPartidos(edicion) {
    const todosLosPartidos = [];
    
    Object.entries(edicion.categorias).forEach(([genero, generoData]) => {
        Object.entries(generoData).forEach(([categoria, categoriaData]) => {
            if (categoriaData.grupos) {
                categoriaData.grupos.forEach(grupo => {
                    if (grupo.partidos) {
                        grupo.partidos.forEach(partido => {
                            const infoDiaHora = extraerDiaYHora(partido.fecha);
                            todosLosPartidos.push({
                                ...partido,
                                genero: genero,
                                categoria: categoria,
                                grupo: grupo.nombre,
                                diaNum: infoDiaHora.dia,
                                horaStr: infoDiaHora.hora,
                                orden: infoDiaHora.orden
                            });
                        });
                    }
                });
            }
        });
    });
    
    // Ordenar partidos por día y hora
    return todosLosPartidos.sort((a, b) => {
        return a.orden - b.orden;
    });
}

// Función para obtener todos los partidos separados por etapa
function obtenerPartidosPorEtapa(edicion) {
    const partidosPorEtapa = {
        'RG': [],
        'USH': []
    };
    
    Object.entries(edicion.categorias).forEach(([genero, generoData]) => {
        Object.entries(generoData).forEach(([categoria, categoriaData]) => {
            if (categoriaData.grupos) {
                categoriaData.grupos.forEach(grupo => {
                    if (grupo.partidos) {
                        grupo.partidos.forEach(partido => {
                            const infoDiaHora = extraerDiaYHora(partido.fecha);
                            const etapa = determinarEtapa(partido);
                            
                            const partidoConInfo = {
                                ...partido,
                                genero: genero,
                                categoria: categoria,
                                grupo: grupo.nombre,
                                diaNum: infoDiaHora.dia,
                                horaStr: infoDiaHora.hora,
                                orden: infoDiaHora.orden,
                                etapa: etapa
                            };
                            
                            partidosPorEtapa[etapa].push(partidoConInfo);
                        });
                    }
                });
            }
        });
    });
    
    // Ordenar partidos de cada etapa por día y hora
    partidosPorEtapa.RG.sort((a, b) => a.orden - b.orden);
    partidosPorEtapa.USH.sort((a, b) => a.orden - b.orden);
    
    return partidosPorEtapa;
}

// Función para determinar los equipos clasificados de cada grupo
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

// Función para determinar el ganador basado en los games
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

// Función modificada para actualizar eliminatorias
function actualizarEliminatorias(eliminatorias, clasificados) {
    const reemplazarClasificacion = (texto) => {
        return texto.replace(/(1ro|2do)\s([A-Z])/g, (match, posicion, grupo) => {
            return clasificados[`${posicion} ${grupo}`] || match;
        });
    };

    // Procesar 16vos
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

    // Procesar octavos
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
    
    // Procesar cuartos
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

    // Procesar semifinales
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
    
    // Procesar final
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

// Función para actualizar el estado activo de los botones
function actualizarBotonesActivos() {
    // Limpiar todos los botones activos
    document.querySelectorAll('.selector-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Activar botones seleccionados
    if (edicionActual) {
        document.querySelector(`.selector-button[onclick*="${edicionActual.id}"]`)?.classList.add('active');
    }
    if (generoActual) {
        document.querySelector(`.selector-button[onclick*="${generoActual}"]`)?.classList.add('active');
    }
    if (categoriaActual) {
        document.querySelector(`.selector-button[onclick*="${categoriaActual}"]`)?.classList.add('active');
    }
}

// Función auxiliar para crear el calendario de partidos de una etapa
function crearCalendarioPartidos(partidos, etapa) {
    const partidosContainer = document.createElement("div");
    partidosContainer.className = `partidos-etapa-${etapa.toLowerCase()}`;
    
    if (partidos.length > 0) {
        // Agrupar partidos por día
        const partidosPorDia = {};
        partidos.forEach(partido => {
            const diaKey = partido.diaNum;
            if (!partidosPorDia[diaKey]) {
                partidosPorDia[diaKey] = [];
            }
            partidosPorDia[diaKey].push(partido);
        });
        
        // Ordenar los días
        const diasOrdenados = Object.keys(partidosPorDia).sort((a, b) => a - b);
        
        // Crear secciones por día
        diasOrdenados.forEach(diaKey => {
            const partidosDelDia = partidosPorDia[diaKey];
            
            // Ordenar partidos del día por hora
            partidosDelDia.sort((a, b) => a.orden - b.orden);
            
            const diaSection = document.createElement("div");
            diaSection.className = "dia-section";
            diaSection.style.marginBottom = "30px";
            diaSection.style.background = "rgba(255, 255, 255, 0.95)";
            diaSection.style.padding = "20px";
            diaSection.style.borderRadius = "10px";
            diaSection.style.boxShadow = "0 4px 15px rgba(0,0,0,0.1)";
            diaSection.style.borderLeft = `5px solid ${obtenerColorDia(parseInt(diaKey))}`;
            
            const nombreDia = formatearDia(parseInt(diaKey));
            const tituloDia = document.createElement("h4");
            tituloDia.textContent = nombreDia;
            tituloDia.style.color = obtenerColorDia(parseInt(diaKey));
            tituloDia.style.marginBottom = "20px";
            tituloDia.style.paddingBottom = "10px";
            tituloDia.style.borderBottom = `2px solid ${obtenerColorDia(parseInt(diaKey))}`;
            tituloDia.style.fontSize = "1.4em";
            tituloDia.style.fontWeight = "bold";
            
            diaSection.appendChild(tituloDia);
            
            // Agrupar partidos por hora dentro del mismo día
            const partidosPorHora = {};
            partidosDelDia.forEach(partido => {
                const horaKey = partido.horaStr;
                if (!partidosPorHora[horaKey]) {
                    partidosPorHora[horaKey] = [];
                }
                partidosPorHora[horaKey].push(partido);
            });
            
            // Crear secciones por hora
            Object.keys(partidosPorHora).sort().forEach(horaKey => {
                const partidosMismaHora = partidosPorHora[horaKey];
                
                const horaSection = document.createElement("div");
                horaSection.className = "hora-section";
                horaSection.style.marginBottom = "20px";
                horaSection.style.padding = "15px";
                horaSection.style.background = "rgba(248, 249, 250, 0.8)";
                horaSection.style.borderRadius = "8px";
                horaSection.style.borderLeft = `4px solid #f39c12`;
                
                const tituloHora = document.createElement("h5");
                tituloHora.textContent = `⏰ ${horaKey} hs`;
                tituloHora.style.color = "#e67e22";
                tituloHora.style.marginBottom = "15px";
                tituloHora.style.fontSize = "1.2em";
                tituloHora.style.display = "flex";
                tituloHora.style.alignItems = "center";
                tituloHora.style.gap = "10px";
                
                horaSection.appendChild(tituloHora);
                
                partidosMismaHora.forEach(partido => {
                    const partidoDiv = document.createElement("div");
                    partidoDiv.className = "partido-provincial";
                    partidoDiv.style.padding = "15px";
                    partidoDiv.style.marginBottom = "12px";
                    partidoDiv.style.borderRadius = "8px";
                    partidoDiv.style.background = partido.sumaPuntos ? 
                        "linear-gradient(135deg, #2ecc71, #27ae60)" : 
                        "linear-gradient(135deg, #3498db, #2980b9)";
                    partidoDiv.style.color = "white";
                    partidoDiv.style.boxShadow = "0 3px 10px rgba(0,0,0,0.2)";
                    partidoDiv.style.position = "relative";
                    
                    // Indicador de cancha si está disponible
                    if (partido.fecha && partido.fecha.includes('Cancha')) {
                        const canchaMatch = partido.fecha.match(/Cancha\s*(\d+)/i);
                        if (canchaMatch) {
                            const canchaIndicator = document.createElement("div");
                            canchaIndicator.style.position = "absolute";
                            canchaIndicator.style.top = "10px";
                            canchaIndicator.style.right = "10px";
                            canchaIndicator.style.background = "rgba(255,255,255,0.3)";
                            canchaIndicator.style.padding = "4px 8px";
                            canchaIndicator.style.borderRadius = "12px";
                            canchaIndicator.style.fontSize = "0.8em";
                            canchaIndicator.style.fontWeight = "bold";
                            canchaIndicator.textContent = `Cancha ${canchaMatch[1]}`;
                            partidoDiv.appendChild(canchaIndicator);
                        }
                    }
                    
                    const infoPartido = document.createElement("div");
                    infoPartido.style.display = "flex";
                    infoPartido.style.justifyContent = "space-between";
                    infoPartido.style.alignItems = "center";
                    infoPartido.style.flexWrap = "wrap";
                    infoPartido.style.gap = "10px";
                    
                    const equiposDiv = document.createElement("div");
                    equiposDiv.style.flex = "1";
                    equiposDiv.style.minWidth = "300px";
                    
                    const equipo1Span = document.createElement("span");
                    equipo1Span.textContent = partido.equipo1;
                    equipo1Span.style.fontWeight = "bold";
                    equipo1Span.style.fontSize = "1.1em";
                    
                    const vsSpan = document.createElement("span");
                    vsSpan.textContent = " vs ";
                    vsSpan.style.margin = "0 10px";
                    vsSpan.style.opacity = "0.8";
                    
                    const equipo2Span = document.createElement("span");
                    equipo2Span.textContent = partido.equipo2;
                    equipo2Span.style.fontWeight = "bold";
                    equipo2Span.style.fontSize = "1.1em";
                    
                    equiposDiv.appendChild(equipo1Span);
                    equiposDiv.appendChild(vsSpan);
                    equiposDiv.appendChild(equipo2Span);
                    
                    const detallesDiv = document.createElement("div");
                    detallesDiv.style.textAlign = "right";
                    detallesDiv.style.flex = "0 0 auto";
                    
                    const categoriaSpan = document.createElement("div");
                    categoriaSpan.textContent = `${partido.genero === 'masculino' ? '♂ Caballeros' : '♀ Damas'} ${partido.categoria}`;
                    categoriaSpan.style.fontWeight = "bold";
                    categoriaSpan.style.marginBottom = "5px";
                    categoriaSpan.style.display = "flex";
                    categoriaSpan.style.alignItems = "center";
                    categoriaSpan.style.gap = "5px";
                    
                    const grupoSpan = document.createElement("div");
                    grupoSpan.textContent = partido.grupo;
                    grupoSpan.style.opacity = "0.9";
                    grupoSpan.style.fontSize = "0.9em";
                    
                    detallesDiv.appendChild(categoriaSpan);
                    detallesDiv.appendChild(grupoSpan);
                    
                    const resultadoDiv = document.createElement("div");
                    resultadoDiv.style.marginTop = "10px";
                    resultadoDiv.style.padding = "8px";
                    resultadoDiv.style.background = "rgba(255,255,255,0.2)";
                    resultadoDiv.style.borderRadius = "5px";
                    resultadoDiv.style.textAlign = "center";
                    resultadoDiv.style.fontWeight = "bold";
                    
                    if (partido.resultado && partido.resultado !== '-' && partido.resultado !== 'A definir') {
                        resultadoDiv.textContent = `Resultado: ${partido.resultado}`;
                        if (partido.games) {
                            resultadoDiv.textContent += ` (${partido.games})`;
                        }
                        resultadoDiv.style.background = "rgba(46, 204, 113, 0.4)";
                    } else {
                        resultadoDiv.textContent = "⏳ Por jugar";
                        resultadoDiv.style.opacity = "0.8";
                        resultadoDiv.style.background = "rgba(241, 196, 15, 0.4)";
                    }
                    
                    // Indicador de partido que suma puntos
                    if (partido.sumaPuntos) {
                        const puntosInfo = document.createElement("div");
                        puntosInfo.style.marginTop = "8px";
                        puntosInfo.style.padding = "5px";
                        puntosInfo.style.background = "rgba(255,255,255,0.3)";
                        puntosInfo.style.borderRadius = "4px";
                        puntosInfo.style.fontSize = "0.9em";
                        puntosInfo.style.fontWeight = "bold";
                        puntosInfo.style.textAlign = "center";
                        
                        if (partido.sumaPuntos === 'ambos') {
                            puntosInfo.textContent = "⭐ SUMA PUNTOS PARA AMBAS CIUDADES";
                        } else if (partido.sumaPuntos === 'equipo1') {
                            puntosInfo.textContent = "⭐ SUMA PUNTOS PARA RÍO GRANDE";
                        } else if (partido.sumaPuntos === 'equipo2') {
                            puntosInfo.textContent = "⭐ SUMA PUNTOS PARA USHUAIA";
                        }
                        
                        partidoDiv.appendChild(puntosInfo);
                    }
                    
                    infoPartido.appendChild(equiposDiv);
                    infoPartido.appendChild(detallesDiv);
                    
                    partidoDiv.appendChild(infoPartido);
                    partidoDiv.appendChild(resultadoDiv);
                    
                    horaSection.appendChild(partidoDiv);
                });
                
                diaSection.appendChild(horaSection);
            });
            
            partidosContainer.appendChild(diaSection);
        });
    }
    
    return partidosContainer;
}

// Función para renderizar la vista del Torneo Provincial
function renderizarTorneoProvincial(edicion) {
    const contenedor = document.getElementById('contenido-ediciones');
    contenedor.innerHTML = '';
    
    // Ocultar selectores de género y categoría para el provincial
    document.querySelectorAll('.selector-group').forEach((grupo, index) => {
        if (index > 0) { // Mantener solo el selector de fecha
            grupo.style.display = 'none';
        }
    });
    
    // Obtener puntos totales
    const puntosTotales = obtenerPuntosTotalesPorCiudad(edicion);
    
    // Obtener partidos separados por etapa
    const partidosPorEtapa = obtenerPartidosPorEtapa(edicion);
    
    // Crear contenedor principal
    const mainContainer = document.createElement("div");
    mainContainer.className = "torneo-provincial-container";
    
    // 1. TABLERO DE PUNTOS
    const tableroPuntosDiv = document.createElement("div");
    tableroPuntosDiv.className = "tablero-puntos-provincial";
    tableroPuntosDiv.style.background = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
    tableroPuntosDiv.style.padding = "30px";
    tableroPuntosDiv.style.borderRadius = "15px";
    tableroPuntosDiv.style.boxShadow = "0 8px 25px rgba(0,0,0,0.3)";
    tableroPuntosDiv.style.color = "white";
    tableroPuntosDiv.style.marginBottom = "40px";
    tableroPuntosDiv.style.textAlign = "center";
    
    const tituloTablero = document.createElement("h2");
    tituloTablero.textContent = "TABLERO DE PUNTOS - TORNEO PROVINCIAL";
    tituloTablero.style.color = "white";
    tituloTablero.style.marginBottom = "30px";
    tituloTablero.style.fontSize = "1.8em";
    tituloTablero.style.textShadow = "2px 2px 4px rgba(0,0,0,0.3)";
    
    const ciudadesContainer = document.createElement("div");
    ciudadesContainer.style.display = "flex";
    ciudadesContainer.style.justifyContent = "space-around";
    ciudadesContainer.style.flexWrap = "wrap";
    ciudadesContainer.style.gap = "30px";
    ciudadesContainer.style.alignItems = "center";
    
    // Río Grande
    const rioGrandeDiv = document.createElement("div");
    rioGrandeDiv.style.textAlign = "center";
    rioGrandeDiv.style.padding = "25px";
    rioGrandeDiv.style.background = "rgba(255,255,255,0.15)";
    rioGrandeDiv.style.borderRadius = "12px";
    rioGrandeDiv.style.minWidth = "200px";
    rioGrandeDiv.style.border = "3px solid rgba(255,255,255,0.3)";
    
    const rioGrandeTitulo = document.createElement("div");
    rioGrandeTitulo.textContent = "RÍO GRANDE";
    rioGrandeTitulo.style.fontWeight = "bold";
    rioGrandeTitulo.style.fontSize = "1.5em";
    rioGrandeTitulo.style.marginBottom = "15px";
    rioGrandeTitulo.style.textTransform = "uppercase";
    
    const rioGrandePuntos = document.createElement("div");
    rioGrandePuntos.textContent = `${puntosTotales['Río Grande']}`;
    rioGrandePuntos.style.fontSize = "4em";
    rioGrandePuntos.style.fontWeight = "bold";
    rioGrandePuntos.style.textShadow = "3px 3px 6px rgba(0,0,0,0.4)";
    
    const rioGrandeLabel = document.createElement("div");
    rioGrandeLabel.textContent = "PUNTOS";
    rioGrandeLabel.style.fontSize = "1.1em";
    rioGrandeLabel.style.opacity = "0.9";
    rioGrandeLabel.style.marginTop = "10px";
    
    rioGrandeDiv.appendChild(rioGrandeTitulo);
    rioGrandeDiv.appendChild(rioGrandePuntos);
    rioGrandeDiv.appendChild(rioGrandeLabel);
    
    // VS Central
    const vsDiv = document.createElement("div");
    vsDiv.style.textAlign = "center";
    vsDiv.style.padding = "20px";
    
    const vsTexto = document.createElement("div");
    vsTexto.textContent = "VS";
    vsTexto.style.fontSize = "3em";
    vsTexto.style.fontWeight = "bold";
    vsTexto.style.opacity = "0.7";
    vsTexto.style.textShadow = "2px 2px 4px rgba(0,0,0,0.3)";
    
    vsDiv.appendChild(vsTexto);
    
    // Ushuaia
    const ushuaiaDiv = document.createElement("div");
    ushuaiaDiv.style.textAlign = "center";
    ushuaiaDiv.style.padding = "25px";
    ushuaiaDiv.style.background = "rgba(255,255,255,0.15)";
    ushuaiaDiv.style.borderRadius = "12px";
    ushuaiaDiv.style.minWidth = "200px";
    ushuaiaDiv.style.border = "3px solid rgba(255,255,255,0.3)";
    
    const ushuaiaTitulo = document.createElement("div");
    ushuaiaTitulo.textContent = "USHUAIA";
    ushuaiaTitulo.style.fontWeight = "bold";
    ushuaiaTitulo.style.fontSize = "1.5em";
    ushuaiaTitulo.style.marginBottom = "15px";
    ushuaiaTitulo.style.textTransform = "uppercase";
    
    const ushuaiaPuntos = document.createElement("div");
    ushuaiaPuntos.textContent = `${puntosTotales['Ushuaia']}`;
    ushuaiaPuntos.style.fontSize = "4em";
    ushuaiaPuntos.style.fontWeight = "bold";
    ushuaiaPuntos.style.textShadow = "3px 3px 6px rgba(0,0,0,0.4)";
    
    const ushuaiaLabel = document.createElement("div");
    ushuaiaLabel.textContent = "PUNTOS";
    ushuaiaLabel.style.fontSize = "1.1em";
    ushuaiaLabel.style.opacity = "0.9";
    ushuaiaLabel.style.marginTop = "10px";
    
    ushuaiaDiv.appendChild(ushuaiaTitulo);
    ushuaiaDiv.appendChild(ushuaiaPuntos);
    ushuaiaDiv.appendChild(ushuaiaLabel);
    
    ciudadesContainer.appendChild(rioGrandeDiv);
    ciudadesContainer.appendChild(vsDiv);
    ciudadesContainer.appendChild(ushuaiaDiv);
    
    tableroPuntosDiv.appendChild(tituloTablero);
    tableroPuntosDiv.appendChild(ciudadesContainer);
    
    // 2. SELECTOR DE ETAPAS
    const selectorEtapasDiv = document.createElement("div");
    selectorEtapasDiv.className = "selector-etapas";
    selectorEtapasDiv.style.marginBottom = "30px";
    selectorEtapasDiv.style.textAlign = "center";
    
    const tituloEtapas = document.createElement("h3");
    tituloEtapas.textContent = "SELECCIONAR ETAPA";
    tituloEtapas.style.color = "#2c3e50";
    tituloEtapas.style.marginBottom = "20px";
    tituloEtapas.style.fontSize = "1.4em";
    
    const botonesEtapas = document.createElement("div");
    botonesEtapas.className = "button-bar";
    botonesEtapas.style.display = "flex";
    botonesEtapas.style.justifyContent = "center";
    botonesEtapas.style.gap = "20px";
    botonesEtapas.style.flexWrap = "wrap";
    
    const botonRG = document.createElement("button");
    botonRG.className = "selector-button active";
    botonRG.textContent = "🏠 ETAPA RÍO GRANDE";
    botonRG.style.padding = "12px 24px";
    botonRG.style.fontSize = "1.1em";
    botonRG.style.fontWeight = "bold";
    botonRG.onclick = function() {
        // Activar botón RG
        botonRG.classList.add('active');
        botonUSH.classList.remove('active');
        // Mostrar etapa RG
        document.getElementById('etapa-rg').style.display = 'block';
        document.getElementById('etapa-ush').style.display = 'none';
    };
    
    const botonUSH = document.createElement("button");
    botonUSH.className = "selector-button";
    botonUSH.textContent = "⛰️ ETAPA USHUAIA";
    botonUSH.style.padding = "12px 24px";
    botonUSH.style.fontSize = "1.1em";
    botonUSH.style.fontWeight = "bold";
    botonUSH.onclick = function() {
        // Activar botón USH
        botonUSH.classList.add('active');
        botonRG.classList.remove('active');
        // Mostrar etapa USH
        document.getElementById('etapa-rg').style.display = 'none';
        document.getElementById('etapa-ush').style.display = 'block';
    };
    
    botonesEtapas.appendChild(botonRG);
    botonesEtapas.appendChild(botonUSH);
    
    selectorEtapasDiv.appendChild(tituloEtapas);
    selectorEtapasDiv.appendChild(botonesEtapas);
    
    // 3. CONTENEDOR DE ETAPAS
    const etapasContainer = document.createElement("div");
    etapasContainer.className = "etapas-container";
    
    // Etapa Río Grande
    const etapaRGDiv = document.createElement("div");
    etapaRGDiv.id = "etapa-rg";
    etapaRGDiv.className = "etapa-container";
    
    const tituloEtapaRG = document.createElement("h3");
    tituloEtapaRG.innerHTML = "🏠 ETAPA RÍO GRANDE";
    tituloEtapaRG.style.color = "#3498db";
    tituloEtapaRG.style.marginBottom = "25px";
    tituloEtapaRG.style.textAlign = "center";
    tituloEtapaRG.style.borderBottom = "3px solid #3498db";
    tituloEtapaRG.style.paddingBottom = "15px";
    tituloEtapaRG.style.fontSize = "1.6em";
    
    etapaRGDiv.appendChild(tituloEtapaRG);
    
    // Renderizar partidos de etapa RG
    if (partidosPorEtapa.RG.length > 0) {
        etapaRGDiv.appendChild(crearCalendarioPartidos(partidosPorEtapa.RG, "RG"));
    } else {
        const noPartidosRG = document.createElement("p");
        noPartidosRG.textContent = "No hay partidos programados para la Etapa Río Grande.";
        noPartidosRG.style.textAlign = "center";
        noPartidosRG.style.color = "#7f8c8d";
        noPartidosRG.style.fontSize = "1.1em";
        etapaRGDiv.appendChild(noPartidosRG);
    }
    
    // Etapa Ushuaia
    const etapaUSHDiv = document.createElement("div");
    etapaUSHDiv.id = "etapa-ush";
    etapaUSHDiv.className = "etapa-container";
    etapaUSHDiv.style.display = "none"; // Ocultar por defecto
    
    const tituloEtapaUSH = document.createElement("h3");
    tituloEtapaUSH.innerHTML = "⛰️ ETAPA USHUAIA";
    tituloEtapaUSH.style.color = "#e74c3c";
    tituloEtapaUSH.style.marginBottom = "25px";
    tituloEtapaUSH.style.textAlign = "center";
    tituloEtapaUSH.style.borderBottom = "3px solid #e74c3c";
    tituloEtapaUSH.style.paddingBottom = "15px";
    tituloEtapaUSH.style.fontSize = "1.6em";
    
    etapaUSHDiv.appendChild(tituloEtapaUSH);
    
    // Renderizar partidos de etapa USH
    if (partidosPorEtapa.USH.length > 0) {
        etapaUSHDiv.appendChild(crearCalendarioPartidos(partidosPorEtapa.USH, "USH"));
    } else {
        const noPartidosUSH = document.createElement("p");
        noPartidosUSH.textContent = "No hay partidos programados para la Etapa Ushuaia.";
        noPartidosUSH.style.textAlign = "center";
        noPartidosUSH.style.color = "#7f8c8d";
        noPartidosUSH.style.fontSize = "1.1em";
        etapaUSHDiv.appendChild(noPartidosUSH);
    }
    
    etapasContainer.appendChild(etapaRGDiv);
    etapasContainer.appendChild(etapaUSHDiv);
    
    // Agregar todo al contenedor principal
    mainContainer.appendChild(tableroPuntosDiv);
    mainContainer.appendChild(selectorEtapasDiv);
    mainContainer.appendChild(etapasContainer);
    contenedor.appendChild(mainContainer);
}

// Función para seleccionar fecha
async function seleccionarFecha(fechaKey) {
    generoActual = null;
    categoriaActual = null;
    
    // Mostrar todos los selectores nuevamente
    document.querySelectorAll('.selector-group').forEach(grupo => {
        grupo.style.display = 'block';
    });
    
    if (edicionActual?.id === fechaKey) {
        edicionActual = null;
        renderizarHeaderEdicion(null);
        document.getElementById("contenido-ediciones").innerHTML = 
            '<p style="text-align: center; color: #7f8c8d;">Seleccione una fecha, género y categoría para ver los resultados.</p>';
        actualizarBotonesActivos();
        return;
    }

    // Mostrar loader mientras se cargan los datos
    document.getElementById("contenido-ediciones").innerHTML = 
        '<div class="loader">Cargando datos del torneo...</div>';
    
    edicionActual = await cargarEdicion(fechaKey);
    
    if (edicionActual) {
        edicionActual.id = fechaKey;
        renderizarHeaderEdicion(edicionActual);
        
        // Para el Torneo Provincial, usar la vista especial
        if (edicionActual.tipo === 'provincial') {
            renderizarTorneoProvincial(edicionActual);
        } else {
            // Para torneos normales, usar la vista estándar
            renderizarEdicion(edicionActual, null, null);
        }
    } else {
        document.getElementById("contenido-ediciones").innerHTML = 
            '<p class="error">Error al cargar los datos del torneo.</p>';
    }
    
    actualizarBotonesActivos();
}

// Función para seleccionar género
function seleccionarGenero(genero) {
    if (edicionActual?.tipo === 'provincial') return; // No hacer nada para provincial
    
    if (generoActual === genero) {
        generoActual = null;
        categoriaActual = null;
        if (edicionActual) {
            renderizarEdicion(edicionActual, null, null);
        }
    } else {
        generoActual = genero;
        categoriaActual = null;
        if (edicionActual) {
            renderizarEdicion(edicionActual, generoActual, null);
        }
    }
    actualizarBotonesActivos();
}

// Función para seleccionar categoría
function seleccionarCategoria(categoria) {
    if (edicionActual?.tipo === 'provincial') return; // No hacer nada para provincial
    
    if (categoriaActual === categoria) {
        categoriaActual = null;
        if (edicionActual && generoActual) {
            renderizarEdicion(edicionActual, generoActual, null);
        }
    } else {
        categoriaActual = categoria;
        if (edicionActual && generoActual) {
            renderizarEdicion(edicionActual, generoActual, categoriaActual);
        }
    }
    actualizarBotonesActivos();
}

// Función para cargar los datos de una edición específica
async function cargarEdicion(edicionKey) {
    const edicionInfo = edicionesInfo[edicionKey];
    if (!edicionInfo) return null;

    // Si ya está cargada, devolver la caché
    if (edicionesCargadas[edicionKey]) {
        return edicionesCargadas[edicionKey];
    }

    const edicion = {
        ...edicionInfo,
        categorias: {
            masculino: {},
            femenino: {}
        }
    };

    const generos = ['masculino', 'femenino'];
    const categorias = ['4ta', '5ta', '6ta', '7ma', '8va'];

    // Cargar datos para cada género y categoría
    for (const genero of generos) {
        for (const categoria of categorias) {
            try {
                const response = await fetch(`${edicionInfo.path}/${genero}/${categoria}.json`);
                if (response.ok) {
                    const data = await response.json();
                    edicion.categorias[genero][categoria] = data;
                    
                    // Calcular estadísticas para el provincial
                    if (edicionInfo.tipo === 'provincial' && data.grupos) {
                        data.grupos.forEach(grupo => {
                            calcularEstadisticasProvincial(grupo);
                        });
                    }
                }
            } catch (error) {
                console.error(`Error cargando ${genero}/${categoria} para ${edicionKey}:`, error);
            }
        }
    }

    // Guardar en caché
    edicionesCargadas[edicionKey] = edicion;
    return edicion;
}

// Función para mostrar el encabezado de la edición
function renderizarHeaderEdicion(edicion) {
    const header = document.getElementById('header-edicion');
    if (!edicion) {
        header.style.display = 'none';
        return;
    }
    
    header.className = `header-edicion ${edicionActual ? edicionActual.id : ''}`;
    header.innerHTML = `
        <h2>${edicion.nombre}</h2>
        <p class="fecha-edicion">${edicion.fecha} | ${edicion.lugar}</p>
        ${edicion.descripcion ? `<p class="descripcion-edicion">${edicion.descripcion}</p>` : ''}
    `;
    header.style.display = 'block';
}

// Función para renderizar la edición con género y categoría (para torneos normales)
function renderizarEdicion(edicion, genero, categoria) {
    const contenedor = document.getElementById('contenido-ediciones');
    
    if (!genero || !categoria) {
        contenedor.innerHTML = '<p style="text-align: center; color: #7f8c8d;">Seleccione género y categoría para ver los resultados.</p>';
        return;
    }

    if (!edicion.categorias[genero] || !edicion.categorias[genero][categoria]) {
        contenedor.innerHTML = '<p class="error">No hay datos disponibles para la selección actual.</p>';
        return;
    }

    // Hacer copia profunda para no modificar los datos originales
    const categoriaData = JSON.parse(JSON.stringify(edicion.categorias[genero][categoria]));
    
    // Actualizar resultados de grupos
    if (categoriaData.grupos) {
        actualizarResultadosGrupos(categoriaData.grupos);
        
        // Calcular estadísticas
        categoriaData.grupos.forEach(grupo => {
            calcularEstadisticas(grupo);
        });
        
        // Determinar clasificados y actualizar eliminatorias
        if (categoriaData.eliminatorias) {
            const clasificados = determinarClasificados(categoriaData.grupos);
            actualizarEliminatorias(categoriaData.eliminatorias, clasificados);
        }
    }

    const categoriaDiv = document.createElement("div");
    categoriaDiv.className = "categoria";

    // Contenedor principal con flexbox para separar grupos y eliminatorias
    const mainContainer = document.createElement("div");
    mainContainer.style.display = "flex";
    mainContainer.style.flexWrap = "wrap";
    mainContainer.style.gap = "30px";
    mainContainer.style.marginBottom = "30px";

    const gruposContainer = document.createElement("div");
    gruposContainer.className = "grupos-container active";
    gruposContainer.id = "grupos-container";

    const eliminatoriasContainer = document.createElement("div");
    eliminatoriasContainer.className = "eliminatorias-container";
    eliminatoriasContainer.id = "eliminatorias-container";

    // Mostrar grupos
    if (categoriaData.grupos) {
        const gruposTitle = document.createElement("h3");
        gruposTitle.textContent = "Fase de Grupos";
        gruposTitle.style.color = "#2c3e50";
        gruposTitle.style.marginBottom = "20px";
        gruposTitle.style.borderBottom = "2px solid #3498db";
        gruposTitle.style.paddingBottom = "10px";
        gruposContainer.appendChild(gruposTitle);

        categoriaData.grupos.forEach(grupo => {
            const grupoDiv = document.createElement("div");
            grupoDiv.className = "grupo";
            grupoDiv.style.marginBottom = "30px";
            grupoDiv.style.background = "rgba(255, 255, 255, 0.9)";
            grupoDiv.style.padding = "15px";
            grupoDiv.style.borderRadius = "8px";
            grupoDiv.style.boxShadow = "0 2px 5px rgba(0,0,0,0.1)";

            const nombreGrupo = document.createElement("h5");
            nombreGrupo.textContent = grupo.nombre;
            nombreGrupo.style.color = "#3498db";
            nombreGrupo.style.marginTop = "0";
            grupoDiv.appendChild(nombreGrupo);

            // Tabla de posiciones
            const tableContainer = document.createElement("div");
            tableContainer.className = "table-container";
            
            const tabla = document.createElement("table");
            const thead = document.createElement("thead");
            thead.innerHTML = `
                <tr>
                    <th>Pos</th>
                    <th>Equipo</th>
                    <th>PJ</th>
                    <th>PG</th>
                    <th>SG</th>
                    <th>SP</th>
                    <th>GF</th>
                    <th>GC</th>
                    <th>DG</th>
                </tr>
            `;
            tabla.appendChild(thead);

            const tbody = document.createElement("tbody");
            const equiposOrdenados = grupo.equipos.sort((a, b) => {
                if (b.PG !== a.PG) return b.PG - a.PG;
                const dsA = a.SG - a.SP;
                const dsB = b.SG - b.SP;
                if (dsB !== dsA) return dsB - dsA;
                return (b.GF - b.GC) - (a.GF - a.GC);
            });

            equiposOrdenados.forEach((equipo, index) => {
                const fila = document.createElement("tr");
                
                // Estilo para primer puesto
                if (index === 0) {
                    fila.classList.add('primer-puesto');
                } 
                // Estilo para segundo puesto
                else if (index === 1) {
                    fila.classList.add('segundo-puesto');
                }
                
                fila.innerHTML = `
                    <td>${index + 1}</td>
                    <td><strong>${equipo.nombre}</strong></td>
                    <td>${equipo.PJ}</td>
                    <td>${equipo.PG}</td>
                    <td>${equipo.SG}</td>
                    <td>${equipo.SP}</td>
                    <td>${equipo.GF}</td>
                    <td>${equipo.GC}</td>
                    <td>${equipo.GF - equipo.GC}</td>
                `;
                tbody.appendChild(fila);
            });
            tabla.appendChild(tbody);
            tableContainer.appendChild(tabla);
            grupoDiv.appendChild(tableContainer);

            // Partidos del grupo
            if (grupo.partidos && grupo.partidos.length > 0) {
                const partidosDiv = document.createElement("div");
                partidosDiv.className = "partidos-grupo";
                partidosDiv.style.marginTop = "15px";

                const tituloPartidos = document.createElement("h6");
                tituloPartidos.textContent = "Partidos del Grupo";
                tituloPartidos.style.color = "#3498db";
                tituloPartidos.style.marginBottom = "10px";
                partidosDiv.appendChild(tituloPartidos);

                grupo.partidos.forEach(p => {
                    const partidoDiv = document.createElement("div");
                    partidoDiv.className = "partido-grupo";

                    const equipos = document.createElement("div");
                    equipos.className = "equipos-partido";
                    equipos.innerHTML = `
                        <div>${p.equipo1} vs ${p.equipo2}</div>
                        ${p.fecha ? `<div class="fecha-partido">${p.fecha}</div>` : ''}
                    `;

                    const resultado = document.createElement("div");
                    resultado.className = "resultado-partido";
                    
                    // Mostrar resultado con games si están disponibles
                    if (p.games) {
                        resultado.innerHTML = `
                            <div class="detalle-games">${p.games}</div>
                        `;
                    } else {
                        resultado.textContent = p.resultado;
                    }

                    partidoDiv.appendChild(equipos);
                    partidoDiv.appendChild(resultado);
                    partidosDiv.appendChild(partidoDiv);
                });

                grupoDiv.appendChild(partidosDiv);
            }

            gruposContainer.appendChild(grupoDiv);
        });
    }

    // Mostrar eliminatorias
    if (categoriaData.eliminatorias) {
        const eliminatoriasTitle = document.createElement("h3");
        eliminatoriasTitle.textContent = "Fase Eliminatoria";
        eliminatoriasTitle.style.color = "#2c3e50";
        eliminatoriasTitle.style.marginBottom = "20px";
        eliminatoriasTitle.style.borderBottom = "2px solid #e74c3c";
        eliminatoriasTitle.style.paddingBottom = "10px";
        eliminatoriasContainer.appendChild(eliminatoriasTitle);

        // 16vos de final
        if (categoriaData.eliminatorias.dieciseisavos && categoriaData.eliminatorias.dieciseisavos.length > 0) {
            const faseDiv = document.createElement("div");
            faseDiv.className = "fase-eliminatoria";
            faseDiv.style.background = "rgba(255, 245, 245, 0.9)";
            faseDiv.style.borderLeft = "4px solid #e74c3c";

            const tituloFase = document.createElement("h5");
            tituloFase.textContent = "16vos de Final";
            tituloFase.style.color = "#e74c3c";
            faseDiv.appendChild(tituloFase);

            categoriaData.eliminatorias.dieciseisavos.forEach(p => {
                const partidoDiv = document.createElement("div");
                partidoDiv.className = "partido-eliminatoria";

                const equiposDiv = document.createElement("div");
                equiposDiv.className = "equipos-eliminatoria";
                
                const equipo1Div = document.createElement("div");
                equipo1Div.className = "equipo-eliminatoria";
                equipo1Div.textContent = p.equipo1;
                
                const vsDiv = document.createElement("div");
                vsDiv.className = "vs-separator";
                vsDiv.textContent = "VS";
                
                const equipo2Div = document.createElement("div");
                equipo2Div.className = "equipo-eliminatoria";
                equipo2Div.textContent = p.equipo2;
                
                equiposDiv.appendChild(equipo1Div);
                equiposDiv.appendChild(vsDiv);
                equiposDiv.appendChild(equipo2Div);

                const resultadoDiv = document.createElement("div");
                resultadoDiv.className = p.resultado && p.resultado !== '-' && p.resultado !== 'A definir' 
                    ? "resultado-eliminatoria" 
                    : "resultado-eliminatoria resultado-pendiente";
                resultadoDiv.textContent = p.resultado || "Por jugar";

                partidoDiv.appendChild(equiposDiv);
                partidoDiv.appendChild(resultadoDiv);
                
                if (p.fecha) {
                    const fechaDiv = document.createElement("div");
                    fechaDiv.className = "fecha-eliminatoria";
                    fechaDiv.textContent = p.fecha;
                    partidoDiv.appendChild(fechaDiv);
                }

                faseDiv.appendChild(partidoDiv);
            });

            eliminatoriasContainer.appendChild(faseDiv);
        }

        // Octavos de final
        if (categoriaData.eliminatorias.octavos && categoriaData.eliminatorias.octavos.length > 0) {
            const faseDiv = document.createElement("div");
            faseDiv.className = "fase-eliminatoria";
            faseDiv.style.background = "rgba(255, 245, 245, 0.9)";
            faseDiv.style.borderLeft = "4px solid #e74c3c";

            const tituloFase = document.createElement("h5");
            tituloFase.textContent = "Octavos de Final";
            tituloFase.style.color = "#e74c3c";
            faseDiv.appendChild(tituloFase);

            categoriaData.eliminatorias.octavos.forEach(p => {
                const partidoDiv = document.createElement("div");
                partidoDiv.className = "partido-eliminatoria";

                const equiposDiv = document.createElement("div");
                equiposDiv.className = "equipos-eliminatoria";
                
                const equipo1Div = document.createElement("div");
                equipo1Div.className = "equipo-eliminatoria";
                equipo1Div.textContent = p.equipo1;
                
                const vsDiv = document.createElement("div");
                vsDiv.className = "vs-separator";
                vsDiv.textContent = "VS";
                
                const equipo2Div = document.createElement("div");
                equipo2Div.className = "equipo-eliminatoria";
                equipo2Div.textContent = p.equipo2;
                
                equiposDiv.appendChild(equipo1Div);
                equiposDiv.appendChild(vsDiv);
                equiposDiv.appendChild(equipo2Div);

                const resultadoDiv = document.createElement("div");
                resultadoDiv.className = p.resultado && p.resultado !== '-' && p.resultado !== 'A definir' 
                    ? "resultado-eliminatoria" 
                    : "resultado-eliminatoria resultado-pendiente";
                resultadoDiv.textContent = p.resultado || "Por jugar";

                partidoDiv.appendChild(equiposDiv);
                partidoDiv.appendChild(resultadoDiv);
                
                if (p.fecha) {
                    const fechaDiv = document.createElement("div");
                    fechaDiv.className = "fecha-eliminatoria";
                    fechaDiv.textContent = p.fecha;
                    partidoDiv.appendChild(fechaDiv);
                }

                faseDiv.appendChild(partidoDiv);
            });

            eliminatoriasContainer.appendChild(faseDiv);
        }

        // Cuartos de final
        if (categoriaData.eliminatorias.cuartos && categoriaData.eliminatorias.cuartos.length > 0) {
            const faseDiv = document.createElement("div");
            faseDiv.className = "fase-eliminatoria";
            faseDiv.style.background = "rgba(255, 245, 245, 0.9)";
            faseDiv.style.borderLeft = "4px solid #e74c3c";

            const tituloFase = document.createElement("h5");
            tituloFase.textContent = "Cuartos de Final";
            tituloFase.style.color = "#e74c3c";
            faseDiv.appendChild(tituloFase);

            categoriaData.eliminatorias.cuartos.forEach(p => {
                const partidoDiv = document.createElement("div");
                partidoDiv.className = "partido-eliminatoria";

                const equiposDiv = document.createElement("div");
                equiposDiv.className = "equipos-eliminatoria";
                
                const equipo1Div = document.createElement("div");
                equipo1Div.className = "equipo-eliminatoria";
                equipo1Div.textContent = p.equipo1;
                
                const vsDiv = document.createElement("div");
                vsDiv.className = "vs-separator";
                vsDiv.textContent = "VS";
                
                const equipo2Div = document.createElement("div");
                equipo2Div.className = "equipo-eliminatoria";
                equipo2Div.textContent = p.equipo2;
                
                equiposDiv.appendChild(equipo1Div);
                equiposDiv.appendChild(vsDiv);
                equiposDiv.appendChild(equipo2Div);

                const resultadoDiv = document.createElement("div");
                resultadoDiv.className = p.resultado && p.resultado !== '-' && p.resultado !== 'A definir' 
                    ? "resultado-eliminatoria" 
                    : "resultado-eliminatoria resultado-pendiente";
                resultadoDiv.textContent = p.resultado || "Por jugar";

                partidoDiv.appendChild(equiposDiv);
                partidoDiv.appendChild(resultadoDiv);
                
                if (p.fecha) {
                    const fechaDiv = document.createElement("div");
                    fechaDiv.className = "fecha-eliminatoria";
                    fechaDiv.textContent = p.fecha;
                    partidoDiv.appendChild(fechaDiv);
                }

                faseDiv.appendChild(partidoDiv);
            });

            eliminatoriasContainer.appendChild(faseDiv);
        }

        // Semifinales
        if (categoriaData.eliminatorias.semis && categoriaData.eliminatorias.semis.length > 0) {
            const faseDiv = document.createElement("div");
            faseDiv.className = "fase-eliminatoria";
            faseDiv.style.background = "rgba(255, 245, 245, 0.9)";
            faseDiv.style.borderLeft = "4px solid #e74c3c";

            const tituloFase = document.createElement("h5");
            tituloFase.textContent = "Semifinales";
            tituloFase.style.color = "#e74c3c";
            faseDiv.appendChild(tituloFase);

            categoriaData.eliminatorias.semis.forEach(p => {
                const partidoDiv = document.createElement("div");
                partidoDiv.className = "partido-eliminatoria";

                const equiposDiv = document.createElement("div");
                equiposDiv.className = "equipos-eliminatoria";
                
                const equipo1Div = document.createElement("div");
                equipo1Div.className = "equipo-eliminatoria";
                equipo1Div.textContent = p.equipo1;
                
                const vsDiv = document.createElement("div");
                vsDiv.className = "vs-separator";
                vsDiv.textContent = "VS";
                
                const equipo2Div = document.createElement("div");
                equipo2Div.className = "equipo-eliminatoria";
                equipo2Div.textContent = p.equipo2;
                
                equiposDiv.appendChild(equipo1Div);
                equiposDiv.appendChild(vsDiv);
                equiposDiv.appendChild(equipo2Div);

                const resultadoDiv = document.createElement("div");
                resultadoDiv.className = p.resultado && p.resultado !== '-' && p.resultado !== 'A definir' 
                    ? "resultado-eliminatoria" 
                    : "resultado-eliminatoria resultado-pendiente";
                resultadoDiv.textContent = p.resultado || "Por jugar";

                partidoDiv.appendChild(equiposDiv);
                partidoDiv.appendChild(resultadoDiv);
                
                if (p.fecha) {
                    const fechaDiv = document.createElement("div");
                    fechaDiv.className = "fecha-eliminatoria";
                    fechaDiv.textContent = p.fecha;
                    partidoDiv.appendChild(fechaDiv);
                }

                faseDiv.appendChild(partidoDiv);
            });

            eliminatoriasContainer.appendChild(faseDiv);
        }

        // Final
        if (categoriaData.eliminatorias.final) {
            const faseDiv = document.createElement("div");
            faseDiv.className = "fase-eliminatoria final";
            faseDiv.style.background = "rgba(255, 245, 245, 0.9)";
            faseDiv.style.borderLeft = "4px solid #e74c3c";

            const tituloFase = document.createElement("h5");
            tituloFase.textContent = "Final";
            tituloFase.style.color = "#e74c3c";
            faseDiv.appendChild(tituloFase);

            const final = categoriaData.eliminatorias.final;
            const partidoDiv = document.createElement("div");
            partidoDiv.className = "partido-eliminatoria";

            const equiposDiv = document.createElement("div");
            equiposDiv.className = "equipos-eliminatoria";
            
            const equipo1Div = document.createElement("div");
            equipo1Div.className = "equipo-eliminatoria";
            equipo1Div.innerHTML = `<strong>${final.equipo1}</strong>`;
            
            const vsDiv = document.createElement("div");
            vsDiv.className = "vs-separator";
            vsDiv.textContent = "VS";
            vsDiv.style.fontWeight = "bold";
            
            const equipo2Div = document.createElement("div");
            equipo2Div.className = "equipo-eliminatoria";
            equipo2Div.innerHTML = `<strong>${final.equipo2}</strong>`;
            
            equiposDiv.appendChild(equipo1Div);
            equiposDiv.appendChild(vsDiv);
            equiposDiv.appendChild(equipo2Div);

            const resultadoDiv = document.createElement("div");
            resultadoDiv.className = final.resultado && final.resultado !== '-' && final.resultado !== 'A definir' 
                ? "resultado-eliminatoria" 
                : "resultado-eliminatoria resultado-pendiente";
            resultadoDiv.textContent = final.resultado || "Por jugar";
            resultadoDiv.style.fontSize = "1.1em";

            partidoDiv.appendChild(equiposDiv);
            partidoDiv.appendChild(resultadoDiv);
            
            if (final.fecha) {
                const fechaDiv = document.createElement("div");
                fechaDiv.className = "fecha-eliminatoria";
                fechaDiv.textContent = final.fecha;
                partidoDiv.appendChild(fechaDiv);
            }

            faseDiv.appendChild(partidoDiv);

            // Mostrar ganador
            if (final.ganador) {
                const ganadorDiv = document.createElement("div");
                ganadorDiv.className = "ganador-final";
                ganadorDiv.style.marginTop = "15px";
                ganadorDiv.style.padding = "10px";
                ganadorDiv.style.background = "#e74c3c";
                ganadorDiv.style.color = "white";
                ganadorDiv.style.borderRadius = "5px";
                ganadorDiv.style.textAlign = "center";
                ganadorDiv.style.fontWeight = "bold";
                ganadorDiv.innerHTML = `
                    <p>🏆 <strong>Campeones:</strong> ${final.ganador} 🏆</p>
                `;
                faseDiv.appendChild(ganadorDiv);
            }

            eliminatoriasContainer.appendChild(faseDiv);
        }
    }

    // Agregar los contenedores al main container
    mainContainer.appendChild(gruposContainer);
    mainContainer.appendChild(eliminatoriasContainer);
    
    // Limpiar y agregar el contenido
    contenedor.innerHTML = '';
    categoriaDiv.appendChild(mainContainer);
    contenedor.appendChild(categoriaDiv);
}

// Función para mostrar sección en móviles
function mostrarSeccion(seccion) {
    // Actualizar botones activos
    document.querySelectorAll('#mobile-view-selector .selector-button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');

    // Mostrar sección seleccionada
    if (seccion === 'grupos') {
        document.getElementById('grupos-container').classList.add('active');
        document.getElementById('eliminatorias-container').classList.remove('active');
    } else {
        document.getElementById('grupos-container').classList.remove('active');
        document.getElementById('eliminatorias-container').classList.add('active');
    }
}

// Inicialización y eventos
document.addEventListener('DOMContentLoaded', function() {
    // Actualizar año del copyright
    document.getElementById('current-year').textContent = new Date().getFullYear();

    // Activar la cuarta fecha al cargar la página
    seleccionarFecha('cuartaFecha');
});

// Detectar cambio de tamaño de pantalla
window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
        // En desktop, mostrar ambas secciones
        const grupos = document.getElementById('grupos-container');
        const eliminatorias = document.getElementById('eliminatorias-container');
        if (grupos) grupos.classList.add('active');
        if (eliminatorias) eliminatorias.classList.add('active');
    }
});