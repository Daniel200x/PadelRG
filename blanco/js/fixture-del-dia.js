// fixture-del-dia.js - Gestión del fixture del día
document.addEventListener('DOMContentLoaded', function() {
    // Variables globales
    let diaActual = 'Jueves';
    let torneosData = {};
    let diasDisponibles = new Set();

    // Inicializar el fixture del día
    initFixtureDelDia();

    function initFixtureDelDia() {
        // Cargar datos de los archivos JSON
        cargarDatosExternos();
        
        // Configurar event listeners para los botones de día
        document.querySelectorAll('.day-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                // Remover clase active de todos los botones
                document.querySelectorAll('.day-btn').forEach(b => b.classList.remove('active'));
                // Agregar clase active al botón clickeado
                this.classList.add('active');
                
                // Actualizar día actual
                diaActual = this.getAttribute('data-day');
                
                // Actualizar la tabla de partidos
                mostrarPartidosDelDia();
            });
        });
    }

    function cargarDatosExternos() {
        const archivosJSON = ['../puntoDeOro/js/ediciones/tercerFecha/femenino/4ta.json',
            '../puntoDeOro/js/ediciones/tercerFecha/femenino/6ta.json',
            '../puntoDeOro/js/ediciones/tercerFecha/femenino/8va.json',
            '../puntoDeOro/js/ediciones/tercerFecha/masculino/4ta.json',
            '../puntoDeOro/js/ediciones/tercerFecha/masculino/6ta.json',
            '../puntoDeOro/js/ediciones/tercerFecha/masculino/8va.json'];
        const promesasCarga = archivosJSON.map(archivo => {
            return fetch(archivo)
                .then(response => {
                    if (!response.ok) throw new Error(`Error al cargar ${archivo}: ${response.status}`);
                    return response.json();
                })
                .then(data => {
                    const nombreCategoria = archivo.replace('.json', '');
                    torneosData[nombreCategoria] = data;
                    return { archivo, success: true };
                })
                .catch(error => {
                    console.error(`Error cargando ${archivo}:`, error);
                    return { archivo, success: false, error };
                });
        });

        Promise.all(promesasCarga)
            .then(resultados => {
                const archivosFallidos = resultados.filter(r => !r.success);
                if (archivosFallidos.length > 0) {
                    console.warn('Algunos archivos no se pudieron cargar:', archivosFallidos);
                    mostrarAdvertencia(archivosFallidos);
                }
                
                // Obtener todos los días disponibles
                obtenerDiasDisponibles();
                
                // Seleccionar el día apropiado
                seleccionarDiaAutomaticamente();
                
                // Mostrar partidos
                mostrarPartidosDelDia();
            })
            .catch(error => {
                console.error('Error inesperado:', error);
                mostrarError();
            });
    }

    function obtenerDiasDisponibles() {
        diasDisponibles.clear();
        
        // Recorrer todas las categorías para encontrar días con partidos
        for (const [categoriaKey, categoria] of Object.entries(torneosData)) {
            // Partidos de grupos
            if (categoria.grupos && Array.isArray(categoria.grupos)) {
                categoria.grupos.forEach(grupo => {
                    if (grupo.partidos && Array.isArray(grupo.partidos)) {
                        grupo.partidos.forEach(partido => {
                            const fechaInfo = extraerInformacionFecha(partido.fecha);
                            if (fechaInfo.dia !== "Por definir") {
                                diasDisponibles.add(fechaInfo.dia);
                            }
                        });
                    }
                });
            }
            
            // Partidos de eliminatorias
            if (categoria.eliminatorias) {
                procesarEliminatoriasParaDias(categoria.eliminatorias);
            }
        }
    }

    function procesarEliminatoriasParaDias(eliminatorias) {
        // Dieciseisavos de final
        if (eliminatorias.dieciseisavos && Array.isArray(eliminatorias.dieciseisavos)) {
            eliminatorias.dieciseisavos.forEach(partido => {
                const fechaInfo = extraerInformacionFecha(partido.fecha);
                if (fechaInfo.dia !== "Por definir") {
                    diasDisponibles.add(fechaInfo.dia);
                }
            });
        }
        
        // Octavos de final
        if (eliminatorias.octavos && Array.isArray(eliminatorias.octavos)) {
            eliminatorias.octavos.forEach(partido => {
                const fechaInfo = extraerInformacionFecha(partido.fecha);
                if (fechaInfo.dia !== "Por definir") {
                    diasDisponibles.add(fechaInfo.dia);
                }
            });
        }
        
        // Cuartos de final
        if (eliminatorias.cuartos && Array.isArray(eliminatorias.cuartos)) {
            eliminatorias.cuartos.forEach(partido => {
                const fechaInfo = extraerInformacionFecha(partido.fecha);
                if (fechaInfo.dia !== "Por definir") {
                    diasDisponibles.add(fechaInfo.dia);
                }
            });
        }
        
        // Semifinales
        if (eliminatorias.semis && Array.isArray(eliminatorias.semis)) {
            eliminatorias.semis.forEach(partido => {
                const fechaInfo = extraerInformacionFecha(partido.fecha);
                if (fechaInfo.dia !== "Por definir") {
                    diasDisponibles.add(fechaInfo.dia);
                }
            });
        }
        
        // Final
        if (eliminatorias.final) {
            const fechaInfo = extraerInformacionFecha(eliminatorias.final.fecha);
            if (fechaInfo.dia !== "Por definir") {
                diasDisponibles.add(fechaInfo.dia);
            }
        }
    }

    function seleccionarDiaAutomaticamente() {
        // Obtener todos los días disponibles
        const diasArray = Array.from(diasDisponibles);
        
        if (diasArray.length > 0) {
            // Ordenar los días cronológicamente
            const ordenDias = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado", "Domingo"];
            const diasOrdenados = diasArray.sort((a, b) => {
                return ordenDias.indexOf(a) - ordenDias.indexOf(b);
            });
            
            // Seleccionar el primer día cronológico con partidos
            diaActual = diasOrdenados[0];
        } else {
            // Si no hay días disponibles, mantener el valor por defecto
            console.warn("No se encontraron días con partidos disponibles");
        }
        
        // Actualizar la interfaz para reflejar el día seleccionado
        document.querySelectorAll('.day-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-day') === diaActual) {
                btn.classList.add('active');
            }
        });
    }

    function mostrarPartidosDelDia() {
        if (Object.keys(torneosData).length === 0) return;
        
        const tableBody = document.getElementById('matchesTableBody');
        tableBody.innerHTML = '';
        
        let todosLosPartidos = [];
        
        // Recorrer todas las categorías
        for (const [categoriaKey, categoria] of Object.entries(torneosData)) {
            // PROCESAR LOS DATOS ANTES DE MOSTRARLOS
            const categoriaProcesada = procesarDatosParaFixture(categoria);
            
            // Partidos de grupos (usar categoriaProcesada en lugar de categoria)
            if (categoriaProcesada.grupos && Array.isArray(categoriaProcesada.grupos)) {
                categoriaProcesada.grupos.forEach(grupo => {
                    if (grupo.partidos && Array.isArray(grupo.partidos)) {
                        grupo.partidos.forEach(partido => {
                            procesarPartido(partido, categoriaProcesada.nombre, grupo.nombre, "Grupo", todosLosPartidos);
                        });
                    }
                });
            }
            
            // Partidos de eliminatorias (usar categoriaProcesada)
            if (categoriaProcesada.eliminatorias) {
                procesarEliminatorias(categoriaProcesada.eliminatorias, categoriaProcesada.nombre, todosLosPartidos);
            }
        }
        
        // Ordenar y mostrar partidos
        todosLosPartidos.sort((a, b) => a.tiempoEnMinutos - b.tiempoEnMinutos);
        mostrarPartidosEnTabla(todosLosPartidos);
    }

    function procesarEliminatorias(eliminatorias, categoria, todosLosPartidos) {
        // Dieciseisavos de final
        if (eliminatorias.dieciseisavos && Array.isArray(eliminatorias.dieciseisavos)) {
            eliminatorias.dieciseisavos.forEach(partido => {
                procesarPartido(partido, categoria, "Dieciseisavos", "Eliminatoria", todosLosPartidos);
            });
        }
        
        // Octavos de final
        if (eliminatorias.octavos && Array.isArray(eliminatorias.octavos)) {
            eliminatorias.octavos.forEach(partido => {
                procesarPartido(partido, categoria, "Octavos", "Eliminatoria", todosLosPartidos);
            });
        }
        
        // Cuartos de final
        if (eliminatorias.cuartos && Array.isArray(eliminatorias.cuartos)) {
            eliminatorias.cuartos.forEach(partido => {
                procesarPartido(partido, categoria, "Cuartos", "Eliminatoria", todosLosPartidos);
            });
        }
        
        // Semifinales
        if (eliminatorias.semis && Array.isArray(eliminatorias.semis)) {
            eliminatorias.semis.forEach(partido => {
                procesarPartido(partido, categoria, "Semifinal", "Eliminatoria", todosLosPartidos);
            });
        }
        
        // Final
        if (eliminatorias.final) {
            procesarPartido(eliminatorias.final, categoria, "Final", "Eliminatoria", todosLosPartidos);
        }
    }

    function procesarPartido(partido, categoria, zona, fase, todosLosPartidos) {
        const fechaInfo = extraerInformacionFecha(partido.fecha);
        
        if (fechaInfo.dia === diaActual) {
            const tiempoEnMinutos = convertirHorarioAMinutos(fechaInfo.horario);
            
            todosLosPartidos.push({
                dia: fechaInfo.dia,
                horario: fechaInfo.horario,
                tiempoEnMinutos: tiempoEnMinutos,
                categoria: categoria,
                zona: zona,
                equipo1: partido.equipo1,
                equipo2: partido.equipo2,
                cancha: fechaInfo.cancha,
                fase: fase,
                partidoRaw: partido
            });
        }
    }

    function mostrarPartidosEnTabla(partidos) {
        const tableBody = document.getElementById('matchesTableBody');
        
        partidos.forEach(partido => {
            const row = document.createElement('tr');
            
            if (partido.fase === "Eliminatoria") {
                row.classList.add('partido-eliminatoria');
            }
            
            // Obtener solo el campo "games" del partido
            const games = partido.partidoRaw.games || "A definir";
            
            row.innerHTML = `
                <td>${partido.horario}</td>
                <td>${partido.categoria}</td>
                <td>${partido.zona}</td>
                <td>${partido.equipo1}</td>
                <td>${partido.equipo2}</td>
                <td>${partido.cancha}</td>
                <td>${games}</td>
            `;
            
            tableBody.appendChild(row);
        });
        
        document.getElementById('totalMatches').textContent = partidos.length;
        
        if (partidos.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="7" style="text-align: center;">No hay partidos programados para el ${diaActual}</td>`;
            tableBody.appendChild(row);
        }
    }

    function convertirHorarioAMinutos(horario) {
        if (!horario || horario === "00:00" || horario === "Por definir") return 24 * 60;
        const [horas, minutos] = horario.split(':').map(Number);
        return horas * 60 + minutos;
    }

    function extraerInformacionFecha(fechaStr) {
        if (!fechaStr || fechaStr === "A definir") {
            return { dia: "Por definir", horario: "00:00", cancha: "Por definir" };
        }
        
        const diasSemana = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado", "Domingo"];
        const diaEncontrado = diasSemana.find(dia => fechaStr.includes(dia));
        
        if (diaEncontrado) {
            let horario = "00:00";
            const horarioMatch = fechaStr.match(/\d{1,2}:\d{2}/);
            if (horarioMatch) horario = horarioMatch[0];
            
            return {
                dia: diaEncontrado,
                horario: horario,
                cancha: fechaStr.includes("Cancha") ? fechaStr.split('Cancha')[1].trim() : "Por definir"
            };
        }
        
        const partes = fechaStr.split(' ');
        if (partes.length >= 4) {
            return { dia: partes[0], horario: partes[1], cancha: partes.slice(3).join(' ') };
        }
        
        return { dia: "Por definir", horario: "00:00", cancha: "Por definir" };
    }

    function mostrarError() {
        const tableBody = document.getElementById('matchesTableBody');
        tableBody.innerHTML = '';
        
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="7" style="text-align: center; color: red;">Error al cargar los datos. Por favor, recarga la página.</td>`;
        tableBody.appendChild(row);
        
        document.getElementById('totalMatches').textContent = '0';
    }

    function mostrarAdvertencia(archivosFallidos) {
        const mensaje = `No se pudieron cargar: ${archivosFallidos.map(a => a.archivo).join(', ')}. Mostrando información disponible.`;
        
        const advertencia = document.createElement('div');
        advertencia.className = 'advertencia-carga';
        advertencia.innerHTML = `
            <div style="background-color: #fff3cd; color: #856404; padding: 10px; 
                        border: 1px solid #ffeaa7; border-radius: 5px; margin-bottom: 15px;">
                <strong>Advertencia:</strong> ${mensaje}
            </div>
        `;
        
        const titulo = document.querySelector('.fixture-container h1');
        titulo.parentNode.insertBefore(advertencia, titulo.nextSibling);
    }

    // FUNCIONES COPIADAS DESDE script.js PARA PROCESAR LOS DATOS

    function procesarDatosParaFixture(categoriaData) {
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
                actualizarEliminatoriasParaFixture(data.eliminatorias, clasificados);
            }
        }
        
        return data;
    }

    function actualizarEliminatoriasParaFixture(eliminatorias, clasificados) {
        const reemplazarClasificacion = (texto) => {
            return texto.replace(/(1ro|2do)\s([A-Z])/g, (match, posicion, grupo) => {
                return clasificados[`${posicion} ${grupo}`] || match;
            });
        };

        // Procesar todas las fases de eliminatorias
        const fases = ['dieciseisavos', 'octavos', 'cuartos', 'semis', 'final'];
        
        fases.forEach(fase => {
            if (eliminatorias[fase]) {
                if (Array.isArray(eliminatorias[fase])) {
                    eliminatorias[fase].forEach(partido => {
                        partido.equipo1 = reemplazarClasificacion(partido.equipo1);
                        partido.equipo2 = reemplazarClasificacion(partido.equipo2);
                    });
                } else if (typeof eliminatorias[fase] === 'object') {
                    // Para la final que es un objeto, no un array
                    eliminatorias[fase].equipo1 = reemplazarClasificacion(eliminatorias[fase].equipo1);
                    eliminatorias[fase].equipo2 = reemplazarClasificacion(eliminatorias[fase].equipo2);
                }
            }
        });
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
});