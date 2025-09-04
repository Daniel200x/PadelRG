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
        const archivosJSON = ['../puntoDeOro/js/ediciones/tercerFecha/femenino/5ta.json',
            '../puntoDeOro/js/ediciones/tercerFecha/femenino/7ma.json',
            '../puntoDeOro/js/ediciones/tercerFecha/masculino/5ta.json',
            '../puntoDeOro/js/ediciones/tercerFecha/masculino/7ma.json'];
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
        // Obtener el día actual en español
        const diasSemana = ["Domingo", "Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado"];
        const fecha = new Date();
        const diaHoy = diasSemana[fecha.getDay()];
        
        // Verificar si el día actual está disponible
        if (diasDisponibles.has(diaHoy)) {
            diaActual = diaHoy;
        } else {
            // Si no está disponible, seleccionar el primer día disponible
            const diasArray = Array.from(diasDisponibles);
            if (diasArray.length > 0) {
                diaActual = diasArray[0];
            } else {
                // Si no hay días disponibles, mantener el valor por defecto
                console.warn("No se encontraron días con partidos disponibles");
            }
        }
        
        // Actualizar la interfaz para reflejar el día seleccionado
        document.querySelectorAll('.day-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-day') === diaActual) {
                btn.classList.add('active');
            }
        });
    }

    // El resto del código se mantiene igual...
    function mostrarPartidosDelDia() {
        if (Object.keys(torneosData).length === 0) return;
        
        const tableBody = document.getElementById('matchesTableBody');
        tableBody.innerHTML = '';
        
        let todosLosPartidos = [];
        
        // Recorrer todas las categorías
        for (const [categoriaKey, categoria] of Object.entries(torneosData)) {
            // Partidos de grupos
            if (categoria.grupos && Array.isArray(categoria.grupos)) {
                categoria.grupos.forEach(grupo => {
                    if (grupo.partidos && Array.isArray(grupo.partidos)) {
                        grupo.partidos.forEach(partido => {
                            procesarPartido(partido, categoria.nombre, grupo.nombre, "Grupo", todosLosPartidos);
                        });
                    }
                });
            }
            
            // Partidos de eliminatorias
            if (categoria.eliminatorias) {
                procesarEliminatorias(categoria.eliminatorias, categoria.nombre, todosLosPartidos);
            }
        }
        
        // Ordenar y mostrar partidos
        todosLosPartidos.sort((a, b) => a.tiempoEnMinutos - b.tiempoEnMinutos);
        mostrarPartidosEnTabla(todosLosPartidos);
    }

    function procesarEliminatorias(eliminatorias, categoria, todosLosPartidos) {
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
});