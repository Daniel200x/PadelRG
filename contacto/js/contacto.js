document.addEventListener('DOMContentLoaded', function() {
    const formulario = document.getElementById('formulario-contacto');
    const mensajeExito = document.getElementById('mensaje-exito');
    
    if (formulario) {
        formulario.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validación básica
            if (validarFormulario()) {
                // Enviar formulario a FormSubmit
                const formData = new FormData(formulario);
                
                fetch(formulario.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                })
                .then(response => {
                    if (response.ok) {
                        // Mostrar mensaje de éxito
                        mensajeExito.style.display = 'block';
                        formulario.reset();
                        
                        // Ocultar mensaje después de 5 segundos
                        setTimeout(() => {
                            mensajeExito.style.display = 'none';
                        }, 5000);
                    } else {
                        throw new Error('Error en el envío del formulario');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Hubo un problema al enviar el mensaje. Por favor, inténtalo de nuevo más tarde.');
                });
            }
        });
    }
    
    function validarFormulario() {
        let valido = true;
        const nombre = document.getElementById('nombre');
        const email = document.getElementById('email');
        const asunto = document.getElementById('asunto');
        const mensaje = document.getElementById('mensaje');
        
        // Validar nombre
        if (nombre.value.trim() === '') {
            marcarError(nombre, 'Por favor ingresa tu nombre');
            valido = false;
        } else {
            quitarError(nombre);
        }
        
        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.value)) {
            marcarError(email, 'Por favor ingresa un email válido');
            valido = false;
        } else {
            quitarError(email);
        }
        
        // Validar asunto
        if (asunto.value === '') {
            marcarError(asunto, 'Por favor selecciona un asunto');
            valido = false;
        } else {
            quitarError(asunto);
        }
        
        // Validar mensaje
        if (mensaje.value.trim() === '') {
            marcarError(mensaje, 'Por favor escribe tu mensaje');
            valido = false;
        } else {
            quitarError(mensaje);
        }
        
        return valido;
    }
    
    function marcarError(campo, mensaje) {
        campo.style.borderColor = '#e74c3c';
        
        // Eliminar mensaje de error anterior si existe
        quitarError(campo);
        
        // Crear elemento de error
        const error = document.createElement('small');
        error.style.color = '#e74c3c';
        error.style.display = 'block';
        error.style.marginTop = '5px';
        error.textContent = mensaje;
        error.className = 'error-message';
        
        campo.parentNode.appendChild(error);
    }
    
    function quitarError(campo) {
        campo.style.borderColor = '#ddd';
        
        const error = campo.parentNode.querySelector('.error-message');
        if (error) {
            error.remove();
        }
    }
});