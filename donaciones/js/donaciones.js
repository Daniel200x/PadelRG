// Funciones para compartir en redes sociales
function compartirFacebook() {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent("¡Echa un vistazo a Pádel RG! Apoya este increíble proyecto de pádel.");
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`, '_blank');
}

function compartirTwitter() {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent("¡Echa un vistazo a Pádel RG! Apoya este increíble proyecto de pádel.");
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
}

function compartirWhatsApp() {
    const text = encodeURIComponent("¡Echa un vistazo a Pádel RG! Apoya este increíble proyecto de pádel. ") + window.location.href;
    window.open(`https://wa.me/?text=${text}`, '_blank');
}

// Efecto de animación al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.donacion-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 200 * index);
    });
});