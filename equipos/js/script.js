// Información básica de cada fecha del torneo
const edicionesInfo = {
    "primerEdicion": {
        nombre: "1ra Edición - Copa Challenger Martin Gallardo 2025",
        fecha: "2025",
        lugar: "Segundo Set",
        descripcion: "Torneo por equipos - Todos contra todos",
        path: "js/ediciones/primerFecha",
        estructura: "todosContraTodos"
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
        if (!partido.resultado || partido.resultado === '-' || partido.resultado === 'A definir') return;

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
    document.querySelectorAll('.selector-button').forEach(btn => {
        btn.classList.remove('active');
    });
    
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

    document.getElementById("contenido-ediciones").innerHTML = 
        '<div class="loader">Cargando datos del torneo...</div>';
    
    edicionActual = await cargarEdicion(fechaKey);
    
    if (edicionActual) {
        edicionActual.id = fechaKey;
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

async function cargarEdicion(edicionKey) {
    const edicionInfo = edicionesInfo[edicionKey];
    if (!edicionInfo) return null;

    if (edicionesCargadas[edicionKey]) {
        return edicionesCargadas[edicionKey];
    }

    const edicion = {
        ...edicionInfo,
        equiposGenerales: [],
        partidosGenerales: [],
        categorias: {
            masculino: {},
            femenino: {}
        }
    };

    const generos = ['masculino', 'femenino'];
    const categorias = ['4ta', '5ta', '6ta', '7ma', '8va'];

    for (const genero of generos) {
        for (const categoria of categorias) {
            try {
                const response = await fetch(`${edicionInfo.path}/${genero}/${categoria}.json`);
                if (response.ok) {
                    const data = await response.json();
                    
                    // Procesar equipos
                    const equiposCategoria = data.equipos || [];
                    edicion.categorias[genero][categoria] = {
                        equipos: equiposCategoria,
                        partidos: []
                    };

                    // Procesar fixture y convertir a array plano de partidos
                    if (data.fixture) {
                        const partidosCategoria = [];
                        for (const ronda in data.fixture) {
                            if (data.fixture.hasOwnProperty(ronda)) {
                                data.fixture[ronda].forEach(partido => {
                                    if (partido.equipo2 !== null) { // Ignorar descansos
                                        partidosCategoria.push({
                                            equipo1: partido.equipo1,
                                            equipo2: partido.equipo2,
                                            resultado: partido.resultado,
                                            games: partido.games,
                                            fecha: partido.fecha,
                                            hora: partido.hora,
                                            genero: genero,
                                            categoria: categoria,
                                            ronda: ronda
                                        });
                                    }
                                });
                            }
                        }
                        edicion.categorias[genero][categoria].partidos = partidosCategoria;
                        
                        // Acumular para tabla general
                        equiposCategoria.forEach(equipo => {
                            if (!edicion.equiposGenerales.some(e => e.nombre === equipo.nombre)) {
                                edicion.equiposGenerales.push({...equipo});
                            }
                        });
                        
                        partidosCategoria.forEach(partido => {
                            if (partido.resultado && partido.resultado !== '' && partido.resultado !== 'Descansa') {
                                edicion.partidosGenerales.push(partido);
                            }
                        });
                    }
                }
            } catch (error) {
                console.error(`Error cargando ${genero}/${categoria} para ${edicionKey}:`, error);
            }
        }
    }

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

// Función para renderizar la edición con grupo general y fixtures específicos
function renderizarEdicion(edicion, genero, categoria) {
    const contenedor = document.getElementById('contenido-ediciones');
    contenedor.innerHTML = '';
    
    // Crear contenedor principal
    const mainContainer = document.createElement("div");
    mainContainer.style.display = "flex";
    mainContainer.style.flexWrap = "wrap";
    mainContainer.style.gap = "30px";
    mainContainer.style.marginBottom = "30px";

    // 1. Mostrar siempre el grupo general con todos los partidos
    const gruposContainer = document.createElement("div");
    gruposContainer.className = "grupos-container active";
    gruposContainer.id = "grupos-container";
    
    const gruposTitle = document.createElement("h3");
    gruposTitle.textContent = "Clasificación General (Todas las categorías)";
    gruposTitle.style.color = "#2c3e50";
    gruposTitle.style.marginBottom = "20px";
    gruposTitle.style.borderBottom = "2px solid #3498db";
    gruposTitle.style.paddingBottom = "10px";
    gruposContainer.appendChild(gruposTitle);

    // Calcular estadísticas generales con TODOS los partidos
    if (edicion.equiposGenerales && edicion.equiposGenerales.length > 0) {
        const grupoGeneral = {
            nombre: "General",
            equipos: JSON.parse(JSON.stringify(edicion.equiposGenerales)),
            partidos: edicion.partidosGenerales
        };
        
        calcularEstadisticas(grupoGeneral);
        
        // Mostrar tabla de posiciones general
        const grupoDiv = document.createElement("div");
        grupoDiv.className = "grupo";
        grupoDiv.style.marginBottom = "30px";
        grupoDiv.style.background = "rgba(255, 255, 255, 0.9)";
        grupoDiv.style.padding = "15px";
        grupoDiv.style.borderRadius = "8px";
        grupoDiv.style.boxShadow = "0 2px 5px rgba(0,0,0,0.1)";

       

        const tableContainer = document.createElement("div");
        tableContainer.className = "table-container";
        
        const tabla = document.createElement("table");
        tabla.id = "tabla-general";
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
        const equiposOrdenados = grupoGeneral.equipos.sort((a, b) => {
            if (b.PG !== a.PG) return b.PG - a.PG;
            const dsA = a.SG - a.SP;
            const dsB = b.SG - b.SP;
            if (dsB !== dsA) return dsB - dsA;
            return (b.GF - b.GC) - (a.GF - a.GC);
        });

        equiposOrdenados.forEach((equipo, index) => {
            const fila = document.createElement("tr");
            fila.dataset.equipo = equipo.nombre;
            
            if (index === 0) fila.classList.add('primer-puesto');
            else if (index === 1) fila.classList.add('segundo-puesto');
            
            // Calcular partidos por categoría para el tooltip
            const partidosEquipo = edicion.partidosGenerales.filter(p => 
                p.equipo1 === equipo.nombre || p.equipo2 === equipo.nombre
            );
            
            const detalleCategorias = {};
            partidosEquipo.forEach(p => {
                const key = `${p.genero} ${p.categoria}`;
                detalleCategorias[key] = (detalleCategorias[key] || 0) + 1;
            });
            
            const tooltipContent = Object.entries(detalleCategorias)
                .map(([cat, count]) => `${cat}: ${count} PJ`)
                .join('<br>');
            
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
        gruposContainer.appendChild(grupoDiv);
    }

    // 2. Mostrar fixtures específicos si se seleccionó género y categoría
    const fixturesContainer = document.createElement("div");
    fixturesContainer.className = "fixtures-container";
    fixturesContainer.id = "fixtures-container";
    
    if (genero && categoria && edicion.categorias[genero] && edicion.categorias[genero][categoria]) {
        const categoriaData = edicion.categorias[genero][categoria];
        
        const fixturesTitle = document.createElement("h3");
        fixturesTitle.textContent = `Fixture - ${genero === 'masculino' ? 'Masculino' : 'Femenino'} ${categoria}`;
        fixturesTitle.style.color = "#2c3e50";
        fixturesTitle.style.marginBottom = "20px";
        fixturesTitle.style.borderBottom = "2px solid #e74c3c";
        fixturesTitle.style.paddingBottom = "10px";
        fixturesContainer.appendChild(fixturesTitle);
        
        // Dentro de la función renderizarEdicion, en la parte de fixtures:
if (categoriaData.partidos && categoriaData.partidos.length > 0) {
    // Agrupar partidos por ronda
    const partidosPorRonda = {};
    categoriaData.partidos.forEach(partido => {
        if (!partidosPorRonda[partido.ronda]) {
            partidosPorRonda[partido.ronda] = [];
        }
        partidosPorRonda[partido.ronda].push(partido);
    });

    // Mostrar cada ronda
    for (const ronda in partidosPorRonda) {
        if (partidosPorRonda.hasOwnProperty(ronda)) {
            const rondaDiv = document.createElement("div");
            rondaDiv.className = "ronda-fixture";
            rondaDiv.style.marginBottom = "20px";
            rondaDiv.style.background = "rgba(255, 255, 255, 0.9)";
            rondaDiv.style.padding = "15px";
            rondaDiv.style.borderRadius = "8px";
            rondaDiv.style.boxShadow = "0 2px 5px rgba(0,0,0,0.1)";

            const rondaTitle = document.createElement("h4");
            rondaTitle.textContent = ronda.split('_').join(' ').toUpperCase();
            rondaTitle.style.color = "#e74c3c";
            rondaTitle.style.marginTop = "0";
            rondaDiv.appendChild(rondaTitle);

            partidosPorRonda[ronda].forEach(p => {
                const partidoDiv = document.createElement("div");
                partidoDiv.className = "partido-grupo";

                const equipos = document.createElement("div");
                equipos.className = "equipos-partido";
                equipos.innerHTML = `
                    <div>${p.equipo1} vs ${p.equipo2}</div>
                    ${p.fecha ? `<div class="fecha-partido">${p.fecha} ${p.hora || ''}</div>` : ''}
                `;

                const resultado = document.createElement("div");
                resultado.className = "resultado-partido";
                
                if (p.resultado === 'Descansa') {
                    resultado.textContent = "Descansa";
                    resultado.style.background = "#7f8c8d";
                } else if (p.games) {
                    resultado.innerHTML = `
                        <div class="detalle-games">${p.games}</div>
                    `;
                } else {
                    resultado.textContent = p.resultado || '-';
                }

                partidoDiv.appendChild(equipos);
                partidoDiv.appendChild(resultado);
                rondaDiv.appendChild(partidoDiv);
            });

            fixturesContainer.appendChild(rondaDiv);
        }
    }
} else {
            fixturesContainer.innerHTML += '<p>No hay partidos programados para esta categoría.</p>';
        }
    } else {
        fixturesContainer.innerHTML = '<p style="text-align: center; color: #7f8c8d;">Seleccione género y categoría para ver los partidos programados.</p>';
    }

    // Agregar contenedores al main
    mainContainer.appendChild(gruposContainer);
    mainContainer.appendChild(fixturesContainer);
    
    // Agregar al DOM
    contenedor.appendChild(mainContainer);

    // Inicializar tooltips
    inicializarTooltips();
}

// Función para filtrar la tabla general por género
function filtrarTablaGeneral(genero) {
    const tabla = document.getElementById('tabla-general');
    if (!tabla) return;
    
    const filas = tabla.querySelectorAll('tbody tr');
    const botones = document.querySelectorAll('.grupo .selector-button');
    
    // Actualizar botones activos
    botones.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Filtrar filas
    filas.forEach(fila => {
        const equipo = fila.dataset.equipo;
        const mostrar = genero === 'todos' || 
                       (edicionActual.partidosGenerales.some(p => 
                           (p.genero === genero) && 
                           (p.equipo1 === equipo || p.equipo2 === equipo)
                       ));
        
        fila.style.display = mostrar ? '' : 'none';
    });
}

// Función para inicializar tooltips
function inicializarTooltips() {
    const tooltips = document.querySelectorAll('[data-tooltip]');
    
    tooltips.forEach(tooltip => {
        tooltip.addEventListener('mouseenter', function(e) {
            const tooltipDiv = document.createElement('div');
            tooltipDiv.className = 'custom-tooltip';
            tooltipDiv.innerHTML = this.getAttribute('data-tooltip');
            
            document.body.appendChild(tooltipDiv);
            
            const rect = this.getBoundingClientRect();
            tooltipDiv.style.left = `${rect.left + rect.width}px`;
            tooltipDiv.style.top = `${rect.top}px`;
            
            this._tooltip = tooltipDiv;
        });
        
        tooltip.addEventListener('mouseleave', function() {
            if (this._tooltip) {
                this._tooltip.remove();
                this._tooltip = null;
            }
        });
    });
}

// Inicialización y eventos
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

    document.querySelectorAll('.nav-links > li > a:not(.dropdown > a)').forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 992) {
                toggleMenu();
            }
        });
    });

    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 992 && 
            navMenu.classList.contains('active') &&
            !e.target.closest('.nav-container')) {
            toggleMenu();
        }
    });
    
    window.addEventListener('resize', function() {
        if (window.innerWidth > 992 && navMenu.classList.contains('active')) {
            toggleMenu();
        }
        
        if (window.innerWidth > 992) {
            document.querySelectorAll('.dropdown-menu').forEach(menu => {
                menu.classList.remove('active');
            });
        }
    });

    // Actualizar año del copyright
    document.getElementById('current-year').textContent = new Date().getFullYear();

    // Activar la primera edición al cargar la página
    seleccionarFecha('primerEdicion');
     // Esperar un breve momento para que se carguen los datos antes de seleccionar género y categoría
    setTimeout(() => {
        seleccionarGenero('masculino');
    }, 100);
});

// Detectar cambio de tamaño de pantalla
window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
        const grupos = document.getElementById('grupos-container');
        const fixtures = document.getElementById('fixtures-container');
        if (grupos) grupos.classList.add('active');
        if (fixtures) fixtures.classList.add('active');
    }
});