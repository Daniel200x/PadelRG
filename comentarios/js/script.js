document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos del DOM
    const commentForm = document.getElementById('commentForm');
    const commentsList = document.getElementById('commentsList');
    const noComments = document.getElementById('noComments');
    const commentsPagination = document.getElementById('commentsPagination');
    const filterTorneo = document.getElementById('filterTorneo');
    
    // Configuración
    const COMMENTS_PER_PAGE = 5;
    let currentPage = 1;
    let currentFilter = 'all';
    
    // Inicializar
    initComments();
    
    // Event Listeners
    commentForm.addEventListener('submit', handleCommentSubmit);
    filterTorneo.addEventListener('change', handleFilterChange);
    
    // Función para inicializar comentarios
    function initComments() {
        loadComments();
        updatePagination();
    }
    
    // Manejar envío de comentario
    function handleCommentSubmit(e) {
        e.preventDefault();
        
        const userName = document.getElementById('userName').value;
        const userEmail = document.getElementById('userEmail').value;
        const userComment = document.getElementById('userComment').value;
        const torneoSelect = document.getElementById('torneoSelect').value;
        
        if (userName && userEmail && userComment) {
            addComment(userName, userEmail, userComment, torneoSelect);
            commentForm.reset();
            alert('¡Comentario enviado con éxito!');
        }
    }
    
    // Manejar cambio de filtro
    function handleFilterChange() {
        currentFilter = filterTorneo.value;
        currentPage = 1;
        loadComments();
        updatePagination();
    }
    
    // Añadir nuevo comentario
    function addComment(name, email, text, torneo) {
        const comment = {
            id: Date.now(),
            name: name,
            email: email,
            text: text,
            torneo: torneo || 'General',
            date: new Date().toLocaleString('es-ES'),
            approved: true // Los comentarios requieren aprobación
        };
        
        // Obtener comentarios existentes
        let comments = JSON.parse(localStorage.getItem('padelComments')) || [];
        
        // Agregar nuevo comentario
        comments.unshift(comment); // Añadir al principio
        
        // Guardar en localStorage
        localStorage.setItem('padelComments', JSON.stringify(comments));
        
        // Recargar comentarios
        loadComments();
        updatePagination();
    }
    
    // Cargar comentarios
    function loadComments() {
        const comments = JSON.parse(localStorage.getItem('padelComments')) || [];
        
        // Filtrar comentarios aprobados y por torneo si es necesario
        let filteredComments = comments.filter(comment => {
            return comment.approved && 
                   (currentFilter === 'all' || comment.torneo === currentFilter);
        });
        
        // Calcular páginas
        const totalPages = Math.ceil(filteredComments.length / COMMENTS_PER_PAGE);
        
        // Ajustar página actual si es necesario
        if (currentPage > totalPages && totalPages > 0) {
            currentPage = totalPages;
        }
        
        // Mostrar mensaje si no hay comentarios
        if (filteredComments.length === 0) {
            commentsList.innerHTML = '';
            noComments.style.display = 'block';
            return;
        }
        
        noComments.style.display = 'none';
        
        // Obtener comentarios para la página actual
        const startIndex = (currentPage - 1) * COMMENTS_PER_PAGE;
        const paginatedComments = filteredComments.slice(
            startIndex, 
            startIndex + COMMENTS_PER_PAGE
        );
        
        // Generar HTML para los comentarios
        let commentsHTML = '';
        
        paginatedComments.forEach(comment => {
            commentsHTML += `
                <div class="comment-item">
                    <div class="comment-header">
                        <div>
                            <span class="comment-author">${comment.name}</span>
                            ${comment.torneo !== 'General' ? 
                                `<span class="comment-torneo">${comment.torneo}</span>` : ''}
                        </div>
                        <span class="comment-date">${comment.date}</span>
                    </div>
                    <div class="comment-text">${comment.text}</div>
                </div>
            `;
        });
        
        commentsList.innerHTML = commentsHTML;
    }
    
    // Actualizar paginación
    function updatePagination() {
        const comments = JSON.parse(localStorage.getItem('padelComments')) || [];
        
        // Filtrar comentarios
        let filteredComments = comments.filter(comment => {
            return comment.approved && 
                   (currentFilter === 'all' || comment.torneo === currentFilter);
        });
        
        const totalPages = Math.ceil(filteredComments.length / COMMENTS_PER_PAGE);
        
        // Ocultar paginación si hay una página o menos
        if (totalPages <= 1) {
            commentsPagination.innerHTML = '';
            return;
        }
        
        // Generar botones de paginación
        let paginationHTML = '';
        
        // Botón anterior
        paginationHTML += `
            <button class="pagination-btn" onclick="changePage(${currentPage - 1})" 
                ${currentPage === 1 ? 'disabled' : ''}>
                <i class="fas fa-chevron-left"></i> Anterior
            </button>
        `;
        
        // Números de página
        for (let i = 1; i <= totalPages; i++) {
            paginationHTML += `
                <button class="pagination-btn ${i === currentPage ? 'active' : ''}" 
                    onclick="changePage(${i})">
                    ${i}
                </button>
            `;
        }
        
        // Botón siguiente
        paginationHTML += `
            <button class="pagination-btn" onclick="changePage(${currentPage + 1})" 
                ${currentPage === totalPages ? 'disabled' : ''}>
                Siguiente <i class="fas fa-chevron-right"></i>
            </button>
        `;
        
        commentsPagination.innerHTML = paginationHTML;
    }
    
    // Cambiar página (necesita ser global para los onclick)
    window.changePage = function(page) {
        const comments = JSON.parse(localStorage.getItem('padelComments')) || [];
        let filteredComments = comments.filter(comment => {
            return comment.approved && 
                   (currentFilter === 'all' || comment.torneo === currentFilter);
        });
        
        const totalPages = Math.ceil(filteredComments.length / COMMENTS_PER_PAGE);
        
        if (page >= 1 && page <= totalPages) {
            currentPage = page;
            loadComments();
            updatePagination();
            
            // Scroll suave hacia la sección de comentarios
            commentsList.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };
    
    // Año actual en el footer
    document.getElementById('current-year').textContent = new Date().getFullYear();
});

// Función para moderar comentarios (para el administrador)
function moderateComments() {
    const comments = JSON.parse(localStorage.getItem('padelComments')) || [];
    const pendingComments = comments.filter(comment => !comment.approved);
    
    if (pendingComments.length === 0) {
        alert('No hay comentarios pendientes de moderación.');
        return;
    }
    
    if (confirm(`Hay ${pendingComments.length} comentarios pendientes de aprobación. ¿Deseas moderarlos ahora?`)) {
        // Aquí podrías redirigir a una página de administración o mostrar un modal
        // Por simplicidad, aprobaremos todos en este ejemplo
        comments.forEach(comment => {
            if (!comment.approved) {
                comment.approved = true;
            }
        });
        
        localStorage.setItem('padelComments', JSON.stringify(comments));
        alert('Todos los comentarios han sido aprobados.');
        location.reload();
    }
}