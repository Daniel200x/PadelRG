// Información básica de cada fecha del torneo
const edicionesInfo = {
    "primerFecha": {
        nombre: "1ra Fecha - Torneo Arenas 2025",
        fecha: "15-30 Marzo 2025",
        lugar: "Arenas",
        descripcion: "Primera fecha 2025",
        path: "js/ediciones/primerFecha"
    },
    "segundaFecha": {
        nombre: "2da Fecha - Torneo Arenas 2025",
        fecha: "15-30 Junio 2025",
        lugar: "Arenas",
        descripcion: "Segunda fecha 2025",
        path: "js/ediciones/segundaFecha"
    },
    "tercerFecha": {
        nombre: "3ra Fecha - Torneo Arenas 2025",
        fecha: "29/07 a 10/08 2025",
        lugar: "Arenas",
        descripcion: "Tercera fecha 2025",
        path: "js/ediciones/tercerFecha"
    }
};

// Almacenamiento de datos cargados
const edicionesCargadas = {};

// Variables para controlar la selección actual
let edicionActual = null;
let generoActual = null;
let categoriaActual = null;

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

// Función para seleccionar fecha
async function seleccionarFecha(fechaKey) {
    generoActual = null;
    categoriaActual = null;
    
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
        edicionActual.id = fechaKey; // Agregar identificador para estilos CSS
        renderizarHeaderEdicion(edicionActual);
        renderizarEdicion(edicionActual, null, null);
    } else {
        document.getElementById("contenido-ediciones").innerHTML = 
            '<p class="error">Error al cargar los datos del torneo.</p>';
    }
    
    actualizarBotonesActivos();
}

// Función para seleccionar género
function seleccionarGenero(genero) {
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

// Función para renderizar la edición con género y categoría
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

    const categoriaData = edicion.categorias[genero][categoria];
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
            // Calcular estadísticas antes de renderizar
            calcularEstadisticas(grupo);
            
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

    if (categoriaData.eliminatorias) {
        const eliminatoriasTitle = document.createElement("h3");
        eliminatoriasTitle.textContent = "Fase Eliminatoria";
        eliminatoriasTitle.style.color = "#2c3e50";
        eliminatoriasTitle.style.marginBottom = "20px";
        eliminatoriasTitle.style.borderBottom = "2px solid #e74c3c";
        eliminatoriasTitle.style.paddingBottom = "10px";
        eliminatoriasContainer.appendChild(eliminatoriasTitle);

        // Dieciseisavos de final
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
                partidoDiv.className = "partido-grupo";

                const equipos = document.createElement("div");
                equipos.className = "equipos-partido";
                equipos.innerHTML = `
                    <div>${p.equipo1} vs ${p.equipo2}</div>
                    ${p.fecha ? `<div class="fecha-partido">${p.fecha}</div>` : ''}
                `;

                const resultado = document.createElement("div");
                resultado.className = "resultado-partido";
                resultado.textContent = p.resultado;
                resultado.style.background = "#e74c3c";
                resultado.style.color = "white";

                partidoDiv.appendChild(equipos);
                partidoDiv.appendChild(resultado);
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
                partidoDiv.className = "partido-grupo";

                const equipos = document.createElement("div");
                equipos.className = "equipos-partido";
                equipos.innerHTML = `
                    <div>${p.equipo1} vs ${p.equipo2}</div>
                    ${p.fecha ? `<div class="fecha-partido">${p.fecha}</div>` : ''}
                `;

                const resultado = document.createElement("div");
                resultado.className = "resultado-partido";
                resultado.textContent = p.resultado;
                resultado.style.background = "#e74c3c";
                resultado.style.color = "white";

                partidoDiv.appendChild(equipos);
                partidoDiv.appendChild(resultado);
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
                partidoDiv.className = "partido-grupo";

                const equipos = document.createElement("div");
                equipos.className = "equipos-partido";
                equipos.innerHTML = `
                    <div>${p.equipo1} vs ${p.equipo2}</div>
                    ${p.fecha ? `<div class="fecha-partido">${p.fecha}</div>` : ''}
                `;

                const resultado = document.createElement("div");
                resultado.className = "resultado-partido";
                resultado.textContent = p.resultado;
                resultado.style.background = "#e74c3c";
                resultado.style.color = "white";

                partidoDiv.appendChild(equipos);
                partidoDiv.appendChild(resultado);
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
                partidoDiv.className = "partido-grupo";

                const equipos = document.createElement("div");
                equipos.className = "equipos-partido";
                equipos.innerHTML = `
                    <div>${p.equipo1} vs ${p.equipo2}</div>
                    ${p.fecha ? `<div class="fecha-partido">${p.fecha}</div>` : ''}
                `;

                const resultado = document.createElement("div");
                resultado.className = "resultado-partido";
                resultado.textContent = p.resultado;
                resultado.style.background = "#e74c3c";
                resultado.style.color = "white";

                partidoDiv.appendChild(equipos);
                partidoDiv.appendChild(resultado);
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
            partidoDiv.className = "partido-grupo";

            const equipos = document.createElement("div");
            equipos.className = "equipos-partido";
            equipos.innerHTML = `
                <div><strong>${final.equipo1}</strong> vs <strong>${final.equipo2}</strong></div>
                ${final.fecha ? `<div class="fecha-partido">${final.fecha}</div>` : ''}
            `;

            const resultado = document.createElement("div");
            resultado.className = "resultado-partido";
            resultado.textContent = final.resultado;
            resultado.style.fontSize = "1.1em";
            resultado.style.background = "#e74c3c";
            resultado.style.color = "white";

            partidoDiv.appendChild(equipos);
            partidoDiv.appendChild(resultado);
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

document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-links > li > a:not(.dropdown-menu a)');
    const dropdownToggles = document.querySelectorAll('.dropdown > a');
    
    // Función para alternar el menú
    function toggleMenu() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.classList.toggle('no-scroll');
    }
    
    // Función para alternar submenús
    function toggleDropdown(e) {
        if (window.innerWidth <= 992) {
            e.preventDefault();
            const dropdownMenu = this.nextElementSibling;
            
            // Cerrar otros dropdowns
            document.querySelectorAll('.dropdown-menu').forEach(menu => {
                if (menu !== dropdownMenu && menu.classList.contains('active')) {
                    menu.classList.remove('active');
                }
            });
            
            dropdownMenu.classList.toggle('active');
        }
    }
    
    // Event listeners
  hamburger.addEventListener('click', function(e) {
    e.stopPropagation();
    toggleMenu();
});

dropdownToggles.forEach(toggle => {
    toggle.addEventListener('click', toggleDropdown);
});

// Solo los enlaces principales (no dropdown) cierran el menú en móviles
document.querySelectorAll('.nav-links > li > a:not(.dropdown > a)').forEach(link => {
    link.addEventListener('click', function() {
        if (window.innerWidth <= 992) {
            toggleMenu();
        }
    });
});

// Cerrar menú al hacer clic fuera
document.addEventListener('click', function(e) {
    if (window.innerWidth <= 992 && 
        navMenu.classList.contains('active') &&
        !e.target.closest('.nav-container')) {
        toggleMenu();
    }
});
    
    // Cerrar menú al cambiar tamaño de pantalla
    window.addEventListener('resize', function() {
        if (window.innerWidth > 992 && navMenu.classList.contains('active')) {
            toggleMenu();
        }
        
        // Resetear dropdowns al cambiar tamaño
        if (window.innerWidth > 992) {
            document.querySelectorAll('.dropdown-menu').forEach(menu => {
                menu.classList.remove('active');
            });
        }
    });
});

// Actualizar año del copyright
document.getElementById('current-year').textContent = new Date().getFullYear();

// Activar la tercera fecha, género masculino y categoría 5ta al cargar la página
window.addEventListener('DOMContentLoaded', (event) => {
    // Seleccionar automáticamente la tercera fecha
    seleccionarFecha('tercerFecha');
    
    // Esperar un breve momento para que se carguen los datos antes de seleccionar género y categoría
    setTimeout(() => {
        seleccionarGenero('masculino');
    }, 100);
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


