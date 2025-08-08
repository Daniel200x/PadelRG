// Código del menú desplegable (igual que en galeria.js)
document.addEventListener('DOMContentLoaded', function() {
    // Menú desplegable para móviles (hamburger menu)
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-links li');
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
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('active')) {
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

    // Resto del código del ranking...
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

    // Función para calcular puntos totales CORREGIDA
    function calculateTotalPoints(player) {
        // Asegurarnos que los valores son números (por si hay null/undefined)
        const puntoDeOro = Number(player.puntoDeOro) || 0;
        const arenas = Number(player.arenas) || 0;
        const segundoSet = Number(player.segundoSet) || 0;
        
        return puntoDeOro + arenas + segundoSet;
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
                points: calculateTotalPoints(player) // Calculamos puntos al cargar
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
                matchesTournament = player[currentTournamentFilter] > 0;
            }
            
            return matchesSearch && matchesCategory && matchesTournament;
        });
        
        // Ordenar
        if (currentTournamentFilter !== 'all') {
            filteredData.sort((a, b) => (b[currentTournamentFilter] || 0) - (a[currentTournamentFilter] || 0));
        } else {
            filteredData.sort((a, b) => b.points - a.points);
        }
        
        currentPage = 1;
        renderRankingTable();
        updatePagination();
    }

    // Renderizar tabla
    function renderRankingTable() {
        rankingTable.innerHTML = '';
        const thead = document.createElement('thead');
        const tbody = document.createElement('tbody');
        tbody.id = 'ranking-data';
        
        const showAllTournaments = currentTournamentFilter === 'all';
        const tournamentKeys = ['puntoDeOro', 'arenas', 'segundoSet'];
        
        const headerRow = document.createElement('tr');
        headerRow.innerHTML = `
            <th>Pos</th>
            <th>Jugador</th>
            ${showAllTournaments ? '<th>Puntos Totales</th>' : ''}
            <th>Categoría</th>
            ${tournamentKeys.map(key => 
                (showAllTournaments || currentTournamentFilter === key) ? `<th>${formatTournamentName(key)}</th>` : ''
            ).join('')}
        `;
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
            
            row.innerHTML = `
                <td>${globalPosition}</td>
                <td>${player.name}</td>
                ${showAllTournaments ? `<td>${player.points}</td>` : ''}
                <td>${player.category}</td>
                ${tournamentKeys.map(key => 
                    (showAllTournaments || currentTournamentFilter === key) ? `<td>${player[key] || 0}</td>` : ''
                ).join('')}
            `;
            tbody.appendChild(row);
        });
        
        rankingTable.appendChild(tbody);
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

    // Debounce para mejorar rendimiento en búsquedas
    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this, args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }

    // Inicialización del ranking
    setupEventListeners();
    loadJSONData();
}); 