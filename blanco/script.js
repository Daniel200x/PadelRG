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
   
                
             
              
           
               
    // Array de publicidades disponibles
    const publicidades = [
        {
            id: 'ad-1',
            title: 'RPA Amoblamientos',
            sponsor: 'Muebles a medida',
            message: 'Descubre la nueva raqueta profesional 2024',
            imageUrl: '../img/muebles.jpeg',
            link: 'https://www.instagram.com/rpamoblamientos.tdf/'
        },
        {
            id: 'ad-2',
            title: 'Padel Pino',
            sponsor: 'Clases de Padel',
            message: 'Máxima comodidad para tus partidos',
            imageUrl: '../img/publi/pino.jpeg',
            link: 'https://www.instagram.com/padelpino/'
        },
        {
            id: 'ad-3',
            title: 'Coren Indumentaria',
            sponsor: 'Ropa deportiva',
            message: 'Mejora tu juego con nuestros entrenadores',
            imageUrl: '../img/publi/coren.jpg',
            link: 'https://www.instagram.com/corenindumentaria/'
        },
        {
            id: 'ad-4',
            title: 'Fix Car',
            sponsor: 'Mecanica integral',
            message: 'Inscríbete en el próximo torneo',
            imageUrl: '../img/publi/fixm.jpg',
            link: 'https://www.instagram.com/fixcar369/'
        },
        {
            id: 'ad-5',
            title: 'Kira TDF',
            sponsor: 'Ropa ',
            message: 'La mejor calidad para cada partido',
            imageUrl: '../img/publi/kira.jpeg',
            link: 'https://www.instagram.com/kira.tdf/'
        },
        {
            id: 'ad-6',
            title: 'Accesorios Pro',
            sponsor: 'Pádel Gear',
            message: 'Todo lo que necesitas para jugar',
            imageUrl: '../img/publi/fritz.jpeg',
            link: 'https://www.instagram.com/fritzautomotores/'
        },
        {
            id: 'ad-7',
            title: 'Clínica de Verano',
            sponsor: 'Pádel Masters',
            message: 'Perfecciona tu técnica este verano',
            imageUrl: '../img/publi/trexx.jpeg',
            link: 'https://www.instagram.com/trexx.tdf/'
        }
    ];
    
    // Configurar event listeners para los botones de control
    prevBtn.addEventListener('click', showPreviousItem);
    nextBtn.addEventListener('click', showNextItem);
    playPauseBtn.addEventListener('click', togglePlayPause);
    
    // Cargar datos de los archivos JSON
    cargarDatosPartidos();
    
    // Función para determinar qué día mostrar
    function obtenerDiaAMostrar() {
        const ahora = new Date();
        const horaActual = ahora.getHours();
        
        // Si es antes de las 3:00 AM, mostrar partidos del día anterior
        if (horaActual < 3) {
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
        let adIndex = 0; // Índice para rotar entre las publicidades
        
        partidos.forEach((partido, index) => {
            // Agregar el partido
            items.push({
                type: 'match',
                data: partido,
                originalIndex: index
            });
            
            // Agregar publicidad cada 5 partidos (después del 5to, 10mo, etc.)
            if ((index + 1) % 3 === 0 && publicidades.length > 0) {
                // Seleccionar publicidad rotativamente
                const publicidad = publicidades[adIndex % publicidades.length];
                items.push({
                    type: 'ad',
                    data: publicidad
                });
                adIndex++; // Incrementar para la siguiente publicidad
            }
        });
        
        console.log(`Se crearon ${items.length} items (${partidos.length} partidos + ${Math.floor(partidos.length / 3)} publicidades)`);
        return items;
    }
    
    function cargarDatosPartidos() {
        const archivosJSON = [
            '../segundoSet/js/ediciones/tercerFecha/femenino/4ta.json',
            '../segundoSet/js/ediciones/tercerFecha/femenino/6ta.json',
            '../segundoSet/js/ediciones/tercerFecha/femenino/8va.json',
            '../segundoSet/js/ediciones/tercerFecha/masculino/4ta.json',
            '../segundoSet/js/ediciones/tercerFecha/masculino/6ta.json',
            '../segundoSet/js/ediciones/tercerFecha/masculino/8va.json'
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
                console.log(`Publicidades disponibles:`, publicidades.length);
                
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
        
        // Procesar partidos de grupos
        if (data.grupos && Array.isArray(data.grupos)) {
            data.grupos.forEach(grupo => {
                if (grupo.partidos && Array.isArray(grupo.partidos)) {
                    grupo.partidos.forEach(partido => {
                        const fechaInfo = extraerInformacionFecha(partido.fecha);
                        const resultado = partido.games || partido.resultado || "A definir";
                        
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
        if (data.eliminatorias) {
            const fases = ['dieciseisavos', 'octavos', 'cuartos', 'semis', 'final'];
            
            fases.forEach(fase => {
                if (data.eliminatorias[fase]) {
                    const partidosFase = Array.isArray(data.eliminatorias[fase]) ? 
                        data.eliminatorias[fase] : [data.eliminatorias[fase]];
                        
                    partidosFase.forEach(partido => {
                        const fechaInfo = extraerInformacionFecha(partido.fecha);
                        const resultado = partido.games || partido.resultado || "A definir";
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
        
        if (item.type === 'match') {
            showMatch(item.data);
        } else if (item.type === 'ad') {
            showAdvertisement(item.data);
        }
        
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
        
        // Crear tarjeta de partido
        matchDisplay.innerHTML = `
            <div class="match-card fade-in">
                <div class="match-header">
                    <div class="match-category">${partido.categoria}</div>
                    <div class="match-zone">${partido.zona}</div>
                </div>
                <div class="match-body">
                    <div class="teams-container">
                        <div class="team">
                            <div class="team-name">${partido.equipo1}</div>
                            ${tieneResultado ? `<div class="team-result">${obtenerResultadoEquipo(partido.resultado, 1)}</div>` : ''}
                        </div>
                        <div class="vs">VS</div>
                        <div class="team">
                            <div class="team-name">${partido.equipo2}</div>
                            ${tieneResultado ? `<div class="team-result">${obtenerResultadoEquipo(partido.resultado, 2)}</div>` : ''}
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
    
    function showAdvertisement(adData) {
        // Crear tarjeta de publicidad
        matchDisplay.innerHTML = `
            <div class="ad-card fade-in">
                <div class="ad-header">
                    <div class="ad-badge">PUBLICIDAD</div>
                    <div class="ad-sponsor">${adData.sponsor}</div>
                </div>
                <div class="ad-body">
                    <div class="ad-image">
                        <img src="${adData.imageUrl}" alt="${adData.title}" />
                    </div>
                    <div class="ad-content">
                        <h3 class="ad-title">${adData.title}</h3>
                        <p class="ad-message">${adData.message}</p>
                        <a href="${adData.link}" class="ad-link" target="_blank">Más información</a>
                    </div>
                </div>
                <div class="ad-footer">
                    <div class="ad-timer">
                        <i class="fas fa-ad"></i>
                        Publicidad - Cambio automático en <span class="countdown-highlight">${countdownValue}</span> segundos
                    </div>
                </div>
            </div>
        `;
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
    
    function obtenerResultadoEquipo(resultado, equipo) {
        if (!resultado || resultado === "A definir") return "-";
        
        try {
            // Intentar parsear el formato de games (ej: "6-3,6-4")
            if (resultado.includes(',')) {
                const sets = resultado.split(',');
                let gamesEquipo = 0;
                
                sets.forEach(set => {
                    const [games1, games2] = set.split('-').map(Number);
                    gamesEquipo += equipo === 1 ? games1 : games2;
                });
                
                return gamesEquipo;
            }
            
            // Si es un formato de sets (ej: "2-1")
            if (resultado.includes('-')) {
                const [sets1, sets2] = resultado.split('-').map(Number);
                return equipo === 1 ? sets1 : sets2;
            }
            
            return "-";
        } catch (error) {
            return "-";
        }
    }
    
    function showPreviousItem() {
        if (itemsDisplay.length === 0) return;
        
        currentItemIndex = (currentItemIndex - 1 + itemsDisplay.length) % itemsDisplay.length;
        showItem(currentItemIndex);
        resetCountdown();
    }
    
    function showNextItem() {
        if (itemsDisplay.length === 0) return;
        
        currentItemIndex = (currentItemIndex + 1) % itemsDisplay.length;
        showItem(currentItemIndex);
        resetCountdown();
    }
    
    function togglePlayPause() {
        isPlaying = !isPlaying;
        
        if (isPlaying) {
            playPauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pausar';
            startAutoChange();
        } else {
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i> Reproducir';
            stopAutoChange();
        }
    }
    
    function startAutoChange() {
        stopAutoChange();
        autoChangeInterval = setInterval(showNextItem, 10000); // Cambiar cada 10 segundos
        countdownInterval = setInterval(updateCountdown, 1000);
    }
    
    function stopAutoChange() {
        if (autoChangeInterval) {
            clearInterval(autoChangeInterval);
        }
        if (countdownInterval) {
            clearInterval(countdownInterval);
        }
    }
    
    function resetCountdown() {
        countdownValue = 10;
        countdownSpan.textContent = countdownValue;
    }
    
    function updateCountdown() {
        countdownValue--;
        countdownSpan.textContent = countdownValue;
        
        if (countdownValue <= 0) {
            resetCountdown();
        }
    }
    
    function mostrarNoResultados(dia) {
        matchDisplay.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>No hay partidos programados para ${dia}</h3>
                <p>Revisa otros días o verifica más tarde.</p>
            </div>
        `;
        
        // Deshabilitar controles
        prevBtn.disabled = true;
        nextBtn.disabled = true;
        playPauseBtn.disabled = true;
    }
    
    function mostrarError() {
        matchDisplay.innerHTML = `
            <div class="no-results">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error al cargar los resultados</h3>
                <p>Por favor, recarga la página o intenta más tarde.</p>
                <button class="control-btn" onclick="location.reload()" style="margin-top: 20px;">Recargar Página</button>
            </div>
        `;
        
        // Deshabilitar controles
        prevBtn.disabled = true;
        nextBtn.disabled = true;
        playPauseBtn.disabled = true;
    }
});