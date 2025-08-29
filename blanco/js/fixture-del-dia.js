// fixture-del-dia.js - Gestión del fixture del día
document.addEventListener('DOMContentLoaded', function() {
    // Variables globales
    let diaActual = 'Miercoles';
    let torneosData = {};

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
        // Array con los nombres de todos los archivos JSON a cargar
        const archivosJSON = [
            '../puntoDeOro/js/ediciones/tercerFecha/femenino/5ta.json',
            '../puntoDeOro/js/ediciones/tercerFecha/femenino/7ma.json',
            '../puntoDeOro/js/ediciones/tercerFecha/masculino/5ta.json',
            '../puntoDeOro/js/ediciones/tercerFecha/masculino/7ma.json',
            // Agregar aquí más archivos JSON cuando sea necesario
            // '8va.json',
            // '6ta.json',
        ];


        // Array para almacenar todas las promesas de carga
        const promesasCarga = archivosJSON.map(archivo => {
            return fetch(archivo)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Error al cargar ${archivo}: ${response.status}`);
                    }
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

        // Esperar a que todas las promesas se resuelvan
        Promise.all(promesasCarga)
            .then(resultados => {
                const archivosFallidos = resultados.filter(r => !r.success);
                
                if (archivosFallidos.length > 0) {
                    console.warn('Algunos archivos no se pudieron cargar:', archivosFallidos);
                    mostrarAdvertencia(archivosFallidos);
                }
                
                mostrarPartidosDelDia();
            })
            .catch(error => {
                console.error('Error inesperado:', error);
                mostrarError();
            });
    }

    function mostrarPartidosDelDia() {
        if (Object.keys(torneosData).length === 0) return;
        
        const tableBody = document.getElementById('matchesTableBody');
        tableBody.innerHTML = '';
        
        let todosLosPartidos = [];
        
        // Recorrer todas las categorías
        for (const [categoriaKey, categoria] of Object.entries(torneosData)) {
            // 1. Partidos de grupos (fase de grupos)
            if (categoria.grupos && Array.isArray(categoria.grupos)) {
                categoria.grupos.forEach(grupo => {
                    if (grupo.partidos && Array.isArray(grupo.partidos)) {
                        grupo.partidos.forEach(partido => {
                            procesarPartido(partido, categoria.nombre, grupo.nombre, "Grupo", todosLosPartidos);
                        });
                    }
                });
            }
            
            // 2. Partidos de eliminatorias (fase final)
            if (categoria.eliminatorias) {
                // Octavos de final
                if (categoria.eliminatorias.octavos && Array.isArray(categoria.eliminatorias.octavos)) {
                    categoria.eliminatorias.octavos.forEach(partido => {
                        procesarPartido(partido, categoria.nombre, "Octavos", "Eliminatoria", todosLosPartidos);
                    });
                }
                
                // Cuartos de final
                if (categoria.eliminatorias.cuartos && Array.isArray(categoria.eliminatorias.cuartos)) {
                    categoria.eliminatorias.cuartos.forEach(partido => {
                        procesarPartido(partido, categoria.nombre, "Cuartos", "Eliminatoria", todosLosPartidos);
                    });
                }
                
                // Semifinales
                if (categoria.eliminatorias.semis && Array.isArray(categoria.eliminatorias.semis)) {
                    categoria.eliminatorias.semis.forEach(partido => {
                        procesarPartido(partido, categoria.nombre, "Semifinal", "Eliminatoria", todosLosPartidos);
                    });
                }
                
                // Final
                if (categoria.eliminatorias.final) {
                    procesarPartido(categoria.eliminatorias.final, categoria.nombre, "Final", "Eliminatoria", todosLosPartidos);
                }
            }
        }
        
        // Ordenar partidos por horario
        todosLosPartidos.sort((a, b) => a.tiempoEnMinutos - b.tiempoEnMinutos);
        
        // Mostrar partidos en la tabla
        todosLosPartidos.forEach(partido => {
            const row = document.createElement('tr');
            
            if (partido.fase === "Eliminatoria") {
                row.classList.add('partido-eliminatoria');
            }
            
            row.innerHTML = `
                <td>${partido.dia}</td>
                <td>${partido.horario}</td>
                <td>${partido.categoria}</td>
                <td>${partido.zona}</td>
                <td>${partido.equipo1}</td>
                <td>${partido.equipo2}</td>
                <td>${partido.cancha}</td>
            `;
            
            tableBody.appendChild(row);
        });
        
        document.getElementById('totalMatches').textContent = todosLosPartidos.length;
        
        if (todosLosPartidos.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="7" style="text-align: center;">No hay partidos programados para el ${diaActual}</td>`;
            tableBody.appendChild(row);
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

    function convertirHorarioAMinutos(horario) {
        if (!horario || horario === "00:00" || horario === "Por definir") {
            return 24 * 60;
        }
        
        const [horas, minutos] = horario.split(':').map(Number);
        return horas * 60 + minutos;
    }

    function extraerInformacionFecha(fechaStr) {
        if (!fechaStr || fechaStr === "A definir") {
            return {
                dia: "Por definir",
                horario: "00:00",
                cancha: "Por definir"
            };
        }
        
        const diasSemana = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sabado", "Domingo"];
        const diaEncontrado = diasSemana.find(dia => fechaStr.includes(dia));
        
        if (diaEncontrado) {
            let horario = "00:00";
            const horarioMatch = fechaStr.match(/\d{1,2}:\d{2}/);
            if (horarioMatch) {
                horario = horarioMatch[0];
            }
            
            return {
                dia: diaEncontrado,
                horario: horario,
                cancha: fechaStr.includes("Cancha") ? fechaStr.split('Cancha')[1].trim() : "Por definir"
            };
        }
        
        const partes = fechaStr.split(' ');
        
        if (partes.length >= 4) {
            return {
                dia: partes[0],
                horario: partes[1],
                cancha: partes.slice(3).join(' ')
            };
        }
        
        return {
            dia: "Por definir",
            horario: "00:00",
            cancha: "Por definir"
        };
    }

    function mostrarError() {
        const tableBody = document.getElementById('matchesTableBody');
        tableBody.innerHTML = '';
        
        const row = document.createElement('tr');
        row.innerHTML = `<td colspan="7" style="text-align: center; color: red;">Error al cargar los datos. Por favor, recarga la página.</td>`;
        tableBody.appendChild(row);
        
        document.getElementById('totalMatches').textContent = '0';
    }
});

    