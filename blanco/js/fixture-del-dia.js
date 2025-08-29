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
                    // Extraer el nombre de la categoría desde el nombre del archivo
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
                // Verificar si todos los archivos se cargaron correctamente
                const archivosFallidos = resultados.filter(r => !r.success);
                
                if (archivosFallidos.length > 0) {
                    console.warn('Algunos archivos no se pudieron cargar:', archivosFallidos);
                    // Mostrar advertencia pero continuar con los archivos que sí se cargaron
                    mostrarAdvertencia(archivosFallidos);
                }
                
                // Mostrar partidos una vez cargados todos los datos disponibles
                mostrarPartidosDelDia();
            })
            .catch(error => {
                console.error('Error inesperado:', error);
                mostrarError();
            });
    }

    function mostrarAdvertencia(archivosFallidos) {
        // Crear mensaje de advertencia
        const mensaje = `No se pudieron cargar los siguientes archivos: ${archivosFallidos.map(a => a.archivo).join(', ')}. 
                         Mostrando información disponible.`;
        
        // Mostrar advertencia en la interfaz (opcional)
        const contenedor = document.querySelector('.fixture-container');
        const advertencia = document.createElement('div');
        advertencia.className = 'advertencia-carga';
        advertencia.innerHTML = `
            <div style="background-color: #fff3cd; color: #856404; padding: 10px; 
                        border: 1px solid #ffeaa7; border-radius: 5px; margin-bottom: 15px;">
                <strong>Advertencia:</strong> ${mensaje}
            </div>
        `;
        
        // Insertar la advertencia después del título
        const titulo = document.querySelector('.fixture-container h1');
        titulo.parentNode.insertBefore(advertencia, titulo.nextSibling);
    }

    function mostrarPartidosDelDia() {
        // Si aún no se han cargado los datos, salir
        if (Object.keys(torneosData).length === 0) return;
        
        const tableBody = document.getElementById('matchesTableBody');
        tableBody.innerHTML = '';
        
        let todosLosPartidos = [];
        
        // Recorrer todas las categorías y recopilar todos los partidos del día
        for (const [categoriaKey, categoria] of Object.entries(torneosData)) {
            // Recorrer todos los grupos de la categoría
            categoria.grupos.forEach(grupo => {
                // Recorrer todos los partidos del grupo
                grupo.partidos.forEach(partido => {
                    // Extraer información de la fecha
                    const fechaInfo = extraerInformacionFecha(partido.fecha);
                    
                    // Si el partido es del día seleccionado
                    if (fechaInfo.dia === diaActual) {
                        // Convertir horario a formato comparable (minutos desde medianoche)
                        const tiempoEnMinutos = convertirHorarioAMinutos(fechaInfo.horario);
                        
                        // Agregar a la lista con información completa
                        todosLosPartidos.push({
                            dia: fechaInfo.dia,
                            horario: fechaInfo.horario,
                            tiempoEnMinutos: tiempoEnMinutos,
                            categoria: categoria.nombre,
                            grupo: grupo.nombre,
                            equipo1: partido.equipo1,
                            equipo2: partido.equipo2,
                            cancha: fechaInfo.cancha,
                            partidoRaw: partido // Mantener referencia al partido original
                        });
                    }
                });
            });
        }
        
        // Ordenar partidos por horario (de más temprano a más tarde)
        todosLosPartidos.sort((a, b) => a.tiempoEnMinutos - b.tiempoEnMinutos);
        
        // Mostrar partidos en la tabla
        todosLosPartidos.forEach(partido => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${partido.dia}</td>
                <td>${partido.horario}</td>
                <td>${partido.categoria}</td>
                <td>${partido.grupo}</td>
                <td>${partido.equipo1}</td>
                <td>${partido.equipo2}</td>
                <td>${partido.cancha}</td>
            `;
            
            tableBody.appendChild(row);
        });
        
        // Actualizar contador de partidos
        document.getElementById('totalMatches').textContent = todosLosPartidos.length;
        
        // Si no hay partidos, mostrar mensaje
        if (todosLosPartidos.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="7" style="text-align: center;">No hay partidos programados para el ${diaActual}</td>`;
            tableBody.appendChild(row);
        }
    }

    // Función auxiliar para convertir horario a minutos desde medianoche
    function convertirHorarioAMinutos(horario) {
        // Formato esperado: "HH:MM"
        const [horas, minutos] = horario.split(':').map(Number);
        return horas * 60 + minutos;
    }

    function extraerInformacionFecha(fechaStr) {
        // Formato esperado: "Dia HH:MM hs Cancha X"
        const partes = fechaStr.split(' ');
        
        return {
            dia: partes[0],
            horario: partes[1],
            cancha: partes.slice(3).join(' ') // "Cancha X" o "Cancha XX"
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










    
