document.addEventListener('DOMContentLoaded', function() {
    const formulario = document.getElementById('formulario-contacto');
    const mensajeExito = document.getElementById('mensaje-exito');
    
    if (formulario) {
        formulario.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Limpiar mensajes de error previos
            limpiarErrores();
            
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
        const errorNombre = document.getElementById('error-nombre');
        const errorEmail = document.getElementById('error-email');
        const errorAsunto = document.getElementById('error-asunto');
        const errorMensaje = document.getElementById('error-mensaje');
        
        // Validar nombre
        if (nombre.value.trim() === '') {
            errorNombre.textContent = 'Por favor ingresa tu nombre';
            nombre.style.borderColor = '#e74c3c';
            valido = false;
        } else {
            nombre.style.borderColor = '#ddd';
        }
        
        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.value)) {
            errorEmail.textContent = 'Por favor ingresa un email válido';
            email.style.borderColor = '#e74c3c';
            valido = false;
        } else {
            email.style.borderColor = '#ddd';
        }
        
        // Validar asunto
        if (asunto.value === '') {
            errorAsunto.textContent = 'Por favor selecciona un asunto';
            asunto.style.borderColor = '#e74c3c';
            valido = false;
        } else {
            asunto.style.borderColor = '#ddd';
        }
        
        // Validar mensaje
        if (mensaje.value.trim() === '') {
            errorMensaje.textContent = 'Por favor escribe tu mensaje';
            mensaje.style.borderColor = '#e74c3c';
            valido = false;
        } else {
            mensaje.style.borderColor = '#ddd';
        }
        
        return valido;
    }
    
    function limpiarErrores() {
        const errores = document.querySelectorAll('.error-message');
        errores.forEach(error => {
            error.textContent = '';
        });
        
        const campos = document.querySelectorAll('.form-group input, .form-group select, .form-group textarea');
        campos.forEach(campo => {
            campo.style.borderColor = '#ddd';
        });
    }
});