document.addEventListener('DOMContentLoaded', function() {
    // Menú desplegable para móviles (hamburger menu)
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-links li');
    
    // Dropdowns del menú
    const dropdowns = document.querySelectorAll('.dropdown');
    
    // Año actual en el footer
    document.getElementById('current-year').textContent = new Date().getFullYear();
    
    // Función para toggle del menú móvil
    function toggleMobileMenu() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    }
    
    // Evento para el botón hamburger
    hamburger.addEventListener('click', toggleMobileMenu);
    
    // Cerrar menú al hacer click en un link (para móviles)
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Verificar si el clic fue en un dropdown o en su ícono
            const isDropdown = link.classList.contains('dropdown') || 
                              e.target.closest('.dropdown') || 
                              e.target.classList.contains('fa-chevron-down') || 
                              e.target.classList.contains('fa-chevron-up');
            
            if (navMenu.classList.contains('active') && !isDropdown) {
                toggleMobileMenu();
            }
        });
    });
    
    // Manejo de dropdowns
    dropdowns.forEach(dropdown => {
        const link = dropdown.querySelector('a');
        const menu = dropdown.querySelector('.dropdown-menu');
        
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Cerrar otros dropdowns abiertos
            dropdowns.forEach(otherDropdown => {
                if (otherDropdown !== dropdown) {
                    otherDropdown.querySelector('.dropdown-menu').classList.remove('active');
                    otherDropdown.querySelector('a i').classList.remove('fa-chevron-up');
                    otherDropdown.querySelector('a i').classList.add('fa-chevron-down');
                }
            });
            
            // Toggle dropdown actual
            menu.classList.toggle('active');
            
            // Cambiar ícono
            const icon = link.querySelector('i');
            if (menu.classList.contains('active')) {
                icon.classList.remove('fa-chevron-down');
                icon.classList.add('fa-chevron-up');
            } else {
                icon.classList.remove('fa-chevron-up');
                icon.classList.add('fa-chevron-down');
            }
        });
    });
    
    // Cerrar dropdowns al hacer click fuera
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown')) {
            dropdowns.forEach(dropdown => {
                dropdown.querySelector('.dropdown-menu').classList.remove('active');
                dropdown.querySelector('a i').classList.remove('fa-chevron-up');
                dropdown.querySelector('a i').classList.add('fa-chevron-down');
            });
        }
    });
});

// Variables de estado
let currentCategory = 'general';
let currentTournamentFilter = 'all';
let currentPage = 1;
const playersPerPage = 10;
let playersData = [];
let filteredData = [];

// Elementos del DOM
const rankingTabs = document.querySelectorAll('.ranking-tab');
const searchInput = document.getElementById('search-player');
const categoryFilter = document.getElementById('filter-category');
const tournamentFilters = document.querySelectorAll('.tournament-filter');
const rankingTable = document.getElementById('ranking-table');
const rankingDataBody = document.getElementById('ranking-data');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const pageInfo = document.getElementById('page-info');
const loadingIndicator = document.getElementById('loading-indicator');

// Función para calcular puntos totales
function calculateTotalPoints(player) {
    if (!player.torneos) return 0;
    
    let total = 0;
    for (const torneo in player.torneos) {
        if (player.torneos[torneo]) {
            total += player.torneos[torneo].reduce((sum, edicion) => sum + (edicion.puntos || 0), 0);
        }
    }
    return total;
}

// Función para obtener puntos por edición con tooltip
function getTournamentPointsByEdition(player, tournamentKey) {
    if (!player.torneos || !player.torneos[tournamentKey] || player.torneos[tournamentKey].length === 0) {
        return "0";
    }
    
    // Cuando estamos viendo un torneo específico, mostramos todas las ediciones
    if (currentTournamentFilter === tournamentKey) {
        return player.torneos[tournamentKey]
            .map(ed => `${ed.edicion}: ${ed.puntos}`)
            .join('<br>');
    }
    
    // Para vista general, mostramos el total con tooltip
    const total = player.torneos[tournamentKey].reduce((sum, ed) => sum + ed.puntos, 0);
    const editions = player.torneos[tournamentKey]
        .map(ed => `${ed.edicion}: ${ed.puntos}`)
        .join('<br>');
    
    return `<div class="tooltip">${total}
            <span class="tooltiptext">${editions}</span>
          </div>`;
}
// Función para filtrar por género
function filterByGender(gender) {
    if (gender === 'general') return playersData;
    return playersData.filter(player => player.gender === gender);
}

// Cargar datos JSON
async function loadJSONData() {
    try {
        loadingIndicator.classList.add('active');
        rankingTable.style.display = 'none';
        
        const response = await fetch('/ranking/data/ranking.json');
        if (!response.ok) throw new Error('Error cargando datos');
        
        const data = await response.json();
        playersData = data.jugadores.map(player => ({
            ...player,
            points: calculateTotalPoints(player)
        }));
        
        loadRankingData();
        
    } catch (error) {
        console.error('Error:', error);
        rankingDataBody.innerHTML = `<tr><td colspan="7" class="error">Error cargando datos</td></tr>`;
    } finally {
        loadingIndicator.classList.remove('active');
        rankingTable.style.display = 'table';
    }
}

// Cargar datos del ranking
function loadRankingData() {
    filteredData = [...filterByGender(currentCategory === 'general' ? 'general' : currentCategory)];
    applyFilters();
}

// Aplicar filtros
function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedCategory = categoryFilter.value;
    
    let data = filterByGender(currentCategory === 'general' ? 'general' : currentCategory);
    
    filteredData = data.filter(player => {
        const matchesSearch = player.name.toLowerCase().includes(searchTerm);
        const matchesCategory = selectedCategory === 'all' || player.category === selectedCategory;
        let matchesTournament = true;
        
        if (currentTournamentFilter !== 'all') {
            matchesTournament = player.torneos && player.torneos[currentTournamentFilter] && 
                              player.torneos[currentTournamentFilter].length > 0;
        }
        
        return matchesSearch && matchesCategory && matchesTournament;
    });
    
    // Ordenar
    if (currentTournamentFilter !== 'all') {
        filteredData.sort((a, b) => {
            const aPoints = a.torneos && a.torneos[currentTournamentFilter] ? 
                a.torneos[currentTournamentFilter].reduce((sum, ed) => sum + ed.puntos, 0) : 0;
            const bPoints = b.torneos && b.torneos[currentTournamentFilter] ? 
                b.torneos[currentTournamentFilter].reduce((sum, ed) => sum + ed.puntos, 0) : 0;
            return bPoints - aPoints;
        });
    } else {
        filteredData.sort((a, b) => b.points - a.points);
    }
    
    currentPage = 1;
    renderRankingTable();
    updatePagination();
}

// Modificar la función renderRankingTable
function renderRankingTable() {
    rankingTable.innerHTML = '';
    const showAllTournaments = currentTournamentFilter === 'all';
    
    // Agregar clase para identificar vista de torneo
    if (!showAllTournaments) {
        rankingTable.classList.add('tournament-view');
    } else {
        rankingTable.classList.remove('tournament-view');
    }

    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');
    tbody.id = 'ranking-data';
    
    const tournamentKeys = ['puntoDeOro', 'arenas', 'segundoSet'];
    
    const headerRow = document.createElement('tr');
    
    // Cabeceras fijas (posición y nombre)
    headerRow.innerHTML = `
        <th>Pos</th>
        <th>Jugador</th>
    `;
    
    if (showAllTournaments) {
        // Vista general
        headerRow.innerHTML += `
            <th>Puntos</th>
            <th>Categoría</th>
            ${tournamentKeys.map(key => `<th>${formatTournamentName(key)}</th>`).join('')}
        `;
    } else {
        // Vista de torneo específico
        const allEditions = getAllEditionsForTournament(currentTournamentFilter);
        
        allEditions.forEach(edicion => {
            headerRow.innerHTML += `<th>${edicion}</th>`;
        });
        
        headerRow.innerHTML += `<th>Total</th>`;
    }
    
    thead.appendChild(headerRow);
    rankingTable.appendChild(thead);
    
    const startIndex = (currentPage - 1) * playersPerPage;
    const playersToShow = filteredData.slice(startIndex, startIndex + playersPerPage);
    
    playersToShow.forEach((player, index) => {
        const globalPosition = startIndex + index + 1;
        const row = document.createElement('tr');
        
        // Destacar primeros puestos
        if (globalPosition === 1) row.classList.add('top-1');
        else if (globalPosition === 2) row.classList.add('top-2');
        else if (globalPosition === 3) row.classList.add('top-3');
        
        // Datos básicos del jugador (siempre visibles)
        row.innerHTML = `
            <td>${globalPosition}</td>
            <td>${player.name}</td>
        `;
        
        if (showAllTournaments) {
            // Vista general
            row.innerHTML += `
                <td>${player.points}</td>
                <td>${player.category}</td>
                ${tournamentKeys.map(key => `
                    <td class="edition-points">${getTournamentPointsByEdition(player, key)}</td>
                `).join('')}
            `;
        } else {
            // Vista de torneo específico
            const allEditions = getAllEditionsForTournament(currentTournamentFilter);
            const playerEditions = player.torneos && player.torneos[currentTournamentFilter] ? 
                player.torneos[currentTournamentFilter] : [];
            
            allEditions.forEach(edicion => {
                const points = playerEditions.find(e => e.edicion === edicion)?.puntos || '0';
                row.innerHTML += `<td>${points}</td>`;
            });
            
            const total = playerEditions.reduce((sum, ed) => sum + ed.puntos, 0);
            row.innerHTML += `<td><strong>${total}</strong></td>`;
        }
        
        tbody.appendChild(row);
    });
    
    rankingTable.appendChild(tbody);
}

// Nueva función auxiliar para obtener todas las ediciones de un torneo
function getAllEditionsForTournament(tournamentKey) {
    const allEditions = new Set();
    filteredData.forEach(player => {
        if (player.torneos && player.torneos[tournamentKey]) {
            player.torneos[tournamentKey].forEach(ed => {
                allEditions.add(ed.edicion);
            });
        }
    });
    return Array.from(allEditions).sort();
}

// Helper para nombres de torneos
function formatTournamentName(key) {
    const names = {
        'puntoDeOro': 'Punto de Oro',
        'arenas': 'Arenas',
        'segundoSet': '2do Set'
    };
    return names[key] || key;
}

// Actualizar paginación
function updatePagination() {
    const totalPages = Math.ceil(filteredData.length / playersPerPage);
    pageInfo.textContent = `Página ${currentPage} de ${totalPages || 1}`;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
}

// Debounce para mejorar rendimiento en búsquedas
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this, args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

// Configurar event listeners
function setupEventListeners() {
    rankingTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            rankingTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentCategory = tab.dataset.category;
            loadRankingData();
        });
    });
    
    searchInput.addEventListener('input', debounce(() => applyFilters(), 300));
    categoryFilter.addEventListener('change', () => applyFilters());
    
    tournamentFilters.forEach(filter => {
        filter.addEventListener('click', () => {
            tournamentFilters.forEach(f => f.classList.remove('active'));
            filter.classList.add('active');
            currentTournamentFilter = filter.dataset.tournament;
            applyFilters();
        });
    });
    
    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderRankingTable();
            updatePagination();
        }
    });
    
    nextPageBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(filteredData.length / playersPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderRankingTable();
            updatePagination();
        }
    });
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadJSONData();
    document.getElementById('current-year').textContent = new Date().getFullYear();
});