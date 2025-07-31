// Función para ordenar los equipos según su rendimiento
function ordenarEquipos(equipos) {
    return equipos.sort((a, b) => {
        // Primero por partidos ganados (PG)
        if (b.PG !== a.PG) return b.PG - a.PG;
        
        // Luego por diferencia de sets (SG - SP)
        const dsA = a.SG - a.SP;
        const dsB = b.SG - b.SP;
        if (dsB !== dsA) return dsB - dsA;
        
        // Finalmente por diferencia de games (GF - GC)
        return (b.GF - b.GC) - (a.GF - a.GC);
    });
}

// Función para renderizar un partido eliminatorio
function renderizarPartido(partido) {
    const partidoDiv = document.createElement('div');
    partidoDiv.className = 'partido';
    
    const equipo1 = document.createElement('div');
    equipo1.className = 'equipo' + (partido.ganador === partido.equipo1 ? ' ganador-partido' : '');
    equipo1.textContent = partido.equipo1;
    partidoDiv.appendChild(equipo1);
    
    const vs = document.createElement('div');
    vs.className = 'vs';
    vs.textContent = 'vs';
    partidoDiv.appendChild(vs);
    
    const equipo2 = document.createElement('div');
    equipo2.className = 'equipo' + (partido.ganador === partido.equipo2 ? ' ganador-partido' : '');
    equipo2.textContent = partido.equipo2;
    partidoDiv.appendChild(equipo2);
    
    const resultado = document.createElement('div');
    resultado.className = 'resultado';
    resultado.textContent = partido.resultado;
    partidoDiv.appendChild(resultado);
    
    return partidoDiv;
}

// Función para renderizar los partidos de grupo
function renderizarPartidosGrupo(partidos) {
    if (!partidos || partidos.length === 0) return null;
    
    const partidosDiv = document.createElement('div');
    partidosDiv.className = 'partidos-grupo';
    
    const titulo = document.createElement('h6');
    titulo.textContent = 'Partidos del Grupo';
    partidosDiv.appendChild(titulo);
    
    partidos.forEach(partido => {
        const partidoDiv = document.createElement('div');
        partidoDiv.className = 'partido-grupo';
        
        const equiposDiv = document.createElement('div');
        equiposDiv.className = 'equipos-partido';
        equiposDiv.textContent = `${partido.equipo1} vs ${partido.equipo2}`;
        
        const resultadoDiv = document.createElement('div');
        resultadoDiv.className = 'resultado-partido';
        resultadoDiv.textContent = partido.resultado;
        
        partidoDiv.appendChild(equiposDiv);
        partidoDiv.appendChild(resultadoDiv);
        partidosDiv.appendChild(partidoDiv);
    });
    
    return partidosDiv;
}

// Función para renderizar las fases eliminatorias
function renderizarEliminatorias(eliminatorias) {
    if (!eliminatorias) return null;
    
    const llavesDiv = document.createElement('div');
    llavesDiv.className = 'llaves';
    
    const titulo = document.createElement('h4');
    titulo.textContent = 'Fase Eliminatoria';
    llavesDiv.appendChild(titulo);
    
    // Octavos de final
    if (eliminatorias.octavos && eliminatorias.octavos.length > 0) {
        const faseDiv = document.createElement('div');
        faseDiv.className = 'fase';
        
        const subtitulo = document.createElement('h5');
        subtitulo.textContent = 'Octavos de Final';
        faseDiv.appendChild(subtitulo);
        
        eliminatorias.octavos.forEach(partido => {
            faseDiv.appendChild(renderizarPartido(partido));
        });
        
        llavesDiv.appendChild(faseDiv);
    }
    
    // Cuartos de final
    if (eliminatorias.cuartos && eliminatorias.cuartos.length > 0) {
        const faseDiv = document.createElement('div');
        faseDiv.className = 'fase';
        
        const subtitulo = document.createElement('h5');
        subtitulo.textContent = 'Cuartos de Final';
        faseDiv.appendChild(subtitulo);
        
        eliminatorias.cuartos.forEach(partido => {
            faseDiv.appendChild(renderizarPartido(partido));
        });
        
        llavesDiv.appendChild(faseDiv);
    }
    
    // Semifinales
    if (eliminatorias.semis && eliminatorias.semis.length > 0) {
        const faseDiv = document.createElement('div');
        faseDiv.className = 'fase';
        
        const subtitulo = document.createElement('h5');
        subtitulo.textContent = 'Semifinales';
        faseDiv.appendChild(subtitulo);
        
        eliminatorias.semis.forEach(partido => {
            faseDiv.appendChild(renderizarPartido(partido));
        });
        
        llavesDiv.appendChild(faseDiv);
    }
    
    // Final
    if (eliminatorias.final) {
        const faseDiv = document.createElement('div');
        faseDiv.className = 'fase';
        
        const subtitulo = document.createElement('h5');
        subtitulo.textContent = 'Final';
        faseDiv.appendChild(subtitulo);
        
        faseDiv.appendChild(renderizarPartido(eliminatorias.final));
        
        llavesDiv.appendChild(faseDiv);
    }
    
    return llavesDiv;
}

// Función para renderizar una categoría completa con género
function renderizarCategoria(categoria, genero) {
    const container = document.createElement('div');
    container.className = 'categoria';
    
    const titulo = document.createElement('h4');
    titulo.textContent = `${genero ? (genero.charAt(0).toUpperCase() + genero.slice(1) + ' - ') : ''}${categoria.nombre}`;
    container.appendChild(titulo);
    
    if (!categoria.grupos || categoria.grupos.length === 0) {
        const noData = document.createElement('div');
        noData.className = 'no-data';
        noData.textContent = 'No hay datos disponibles para esta categoría';
        container.appendChild(noData);
        return container;
    }
    
    // Renderizar grupos
    categoria.grupos.forEach(grupo => {
        const equiposOrdenados = ordenarEquipos(grupo.equipos);
        
        const grupoDiv = document.createElement('div');
        grupoDiv.className = 'grupo';
        
        const grupoTitulo = document.createElement('h5');
        grupoTitulo.textContent = grupo.nombre;
        grupoDiv.appendChild(grupoTitulo);
        
        const scrollableDiv = document.createElement('div');
        scrollableDiv.className = 'scrollable';
        
        const tabla = document.createElement('table');
        
        // Encabezados con tooltips
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        const headers = ['Pos', 'Equipo', 'PJ', 'PG', 'SG', 'SP', 'DS', 'GF', 'GC', 'DG'];
        const tooltips = [
            'Posición', 'Nombre del equipo', 'Partidos jugados', 'Partidos ganados',
            'Sets a favor', 'Sets en contra', 'Diferencia de sets',
            'Games a favor', 'Games en contra', 'Diferencia de games'
        ];
        
        headers.forEach((text, index) => {
            const th = document.createElement('th');
            th.textContent = text;
            th.title = tooltips[index];
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        tabla.appendChild(thead);
        
        // Cuerpo de la tabla
        const tbody = document.createElement('tbody');
        equiposOrdenados.forEach((equipo, index) => {
            const row = document.createElement('tr');
            if (index === 0) row.classList.add('ganador');
            
            // Posición
            const posicion = document.createElement('td');
            posicion.textContent = index + 1;
            row.appendChild(posicion);
            
            // Nombre del equipo
            const nombre = document.createElement('td');
            nombre.textContent = equipo.nombre;
            nombre.className = 'nombre-equipo';
            row.appendChild(nombre);
            
            // Partidos jugados
            const pj = document.createElement('td');
            pj.textContent = equipo.PJ;
            row.appendChild(pj);
            
            // Partidos ganados
            const pg = document.createElement('td');
            pg.textContent = equipo.PG;
            row.appendChild(pg);
            
            // Sets a favor (SG)
            const sg = document.createElement('td');
            sg.textContent = equipo.SG;
            row.appendChild(sg);
            
            // Sets en contra (SP)
            const sp = document.createElement('td');
            sp.textContent = equipo.SP;
            row.appendChild(sp);
            
            // Diferencia de sets (DS)
            const ds = document.createElement('td');
            ds.textContent = equipo.SG - equipo.SP;
            row.appendChild(ds);
            
            // Games a favor (GF)
            const gf = document.createElement('td');
            gf.textContent = equipo.GF;
            row.appendChild(gf);
            
            // Games en contra (GC)
            const gc = document.createElement('td');
            gc.textContent = equipo.GC;
            row.appendChild(gc);
            
            // Diferencia de games (DG)
            const dg = document.createElement('td');
            dg.textContent = equipo.GF - equipo.GC;
            row.appendChild(dg);
            
            tbody.appendChild(row);
        });
        
        tabla.appendChild(tbody);
        scrollableDiv.appendChild(tabla);
        grupoDiv.appendChild(scrollableDiv);
        
        // Renderizar partidos del grupo si existen
        const partidosDiv = renderizarPartidosGrupo(grupo.partidos);
        if (partidosDiv) {
            grupoDiv.appendChild(partidosDiv);
        }
        
        container.appendChild(grupoDiv);
    });
    
    // Renderizar eliminatorias si existen
    const eliminatoriasDiv = renderizarEliminatorias(categoria.eliminatorias);
    if (eliminatoriasDiv) {
        container.appendChild(eliminatoriasDiv);
    }
    
    return container;
}

// Función para renderizar una edición completa con género y categoría
function renderizarEdicion(edicion, genero, categoriaKey) {
    const contenedor = document.getElementById('contenido-ediciones');
    contenedor.innerHTML = "";

    if (!genero || !categoriaKey || !edicion.categorias[genero] || !edicion.categorias[genero][categoriaKey]) {
        contenedor.innerHTML = "<p>Seleccione género y categoría para ver los resultados.</p>";
        return;
    }

    const categoria = edicion.categorias[genero][categoriaKey];
    const categoriaDiv = document.createElement("div");
    categoriaDiv.className = "categoria";

    const titulo = document.createElement("h4");
    titulo.textContent = `${genero.charAt(0).toUpperCase() + genero.slice(1)} - ${categoria.nombre} - ${edicion.nombre} (${edicion.fecha})`;
    categoriaDiv.appendChild(titulo);

    // Mostrar grupos
    if (categoria.grupos) {
        categoria.grupos.forEach(grupo => {
            const grupoDiv = document.createElement("div");
            grupoDiv.className = "grupo";

            const nombreGrupo = document.createElement("h5");
            nombreGrupo.textContent = grupo.nombre;
            grupoDiv.appendChild(nombreGrupo);

            const tabla = document.createElement("table");
            const thead = document.createElement("thead");
            thead.innerHTML = "<tr><th>Equipo</th><th>PJ</th><th>PG</th><th>SG</th><th>SP</th><th>GF</th><th>GC</th></tr>";
            tabla.appendChild(thead);

            const tbody = document.createElement("tbody");
            grupo.equipos.forEach(eq => {
                const fila = document.createElement("tr");
                fila.innerHTML = `<td>${eq.nombre}</td><td>${eq.PJ}</td><td>${eq.PG}</td><td>${eq.SG}</td><td>${eq.SP}</td><td>${eq.GF}</td><td>${eq.GC}</td>`;
                tbody.appendChild(fila);
            });
            tabla.appendChild(tbody);
            grupoDiv.appendChild(tabla);

            // Mostrar partidos (si existen)
            if (grupo.partidos) {
                const partidosDiv = document.createElement("div");
                partidosDiv.className = "partidos-grupo";

                const tituloPartidos = document.createElement("h6");
                tituloPartidos.textContent = "Partidos del Grupo";
                partidosDiv.appendChild(tituloPartidos);

                grupo.partidos.forEach(p => {
                    const partidoDiv = document.createElement("div");
                    partidoDiv.className = "partido-grupo";

                    const equipos = document.createElement("div");
                    equipos.className = "equipos-partido";
                    equipos.textContent = `${p.equipo1} vs ${p.equipo2}`;

                    const resultado = document.createElement("div");
                    resultado.className = "resultado-partido";
                    resultado.textContent = p.resultado;

                    partidoDiv.appendChild(equipos);

                    if (p.fecha) {
                        const fecha = document.createElement("div");
                        fecha.className = "fecha-partido";
                        fecha.textContent = p.fecha;
                        partidoDiv.appendChild(fecha);
                    }

                    partidoDiv.appendChild(resultado);
                    partidosDiv.appendChild(partidoDiv);
                });

                grupoDiv.appendChild(partidosDiv);
            }

            categoriaDiv.appendChild(grupoDiv);
        });
    }

    // Mostrar eliminatorias si existen
    if (categoria.eliminatorias) {
        const fases = ["octavos", "cuartos", "semis"];
        fases.forEach(fase => {
            if (categoria.eliminatorias[fase]) {
                const faseDiv = document.createElement("div");
                faseDiv.className = "fase-eliminatoria";

                const tituloFase = document.createElement("h5");
                tituloFase.textContent = fase.charAt(0).toUpperCase() + fase.slice(1);
                faseDiv.appendChild(tituloFase);

                categoria.eliminatorias[fase].forEach(p => {
                    const partidoDiv = document.createElement("div");
                    partidoDiv.className = "partido-grupo";

                    const equipos = document.createElement("div");
                    equipos.className = "equipos-partido";
                    equipos.textContent = `${p.equipo1} vs ${p.equipo2}`;

                    const resultado = document.createElement("div");
                    resultado.className = "resultado-partido";
                    resultado.textContent = p.resultado;

                    partidoDiv.appendChild(equipos);

                    if (p.fecha) {
                        const fecha = document.createElement("div");
                        fecha.className = "fecha-partido";
                        fecha.textContent = p.fecha;
                        partidoDiv.appendChild(fecha);
                    }

                    partidoDiv.appendChild(resultado);
                    faseDiv.appendChild(partidoDiv);
                });

                categoriaDiv.appendChild(faseDiv);
            }
        });

        if (categoria.eliminatorias.final) {
            const finalDiv = document.createElement("div");
            finalDiv.className = "fase-eliminatoria";

            const tituloFinal = document.createElement("h5");
            tituloFinal.textContent = "Final";
            finalDiv.appendChild(tituloFinal);

            const final = categoria.eliminatorias.final;
            const partidoDiv = document.createElement("div");
            partidoDiv.className = "partido-grupo";

            const equipos = document.createElement("div");
            equipos.className = "equipos-partido";
            equipos.textContent = `${final.equipo1} vs ${final.equipo2}`;

            const resultado = document.createElement("div");
            resultado.className = "resultado-partido";
            resultado.textContent = final.resultado;

            partidoDiv.appendChild(equipos);

            if (final.fecha) {
                const fecha = document.createElement("div");
                fecha.className = "fecha-partido";
                fecha.textContent = final.fecha;
                partidoDiv.appendChild(fecha);
            }

            partidoDiv.appendChild(resultado);
            finalDiv.appendChild(partidoDiv);
            categoriaDiv.appendChild(finalDiv);
        }
    }

    contenedor.appendChild(categoriaDiv);
}