// tarjeta-derecha.js
class TarjetaDerecha {
    constructor(containerId, imagenes = []) {
        this.containerId = containerId;
        this.imagenes = imagenes;
        this.container = null;
        this.intervaloCambio = null;
    }

    inicializar() {
        this.container = document.getElementById(this.containerId);
        if (!this.container) {
            console.error(`No se encontró el contenedor con ID: ${this.containerId}`);
            return;
        }

        this.renderizar();
        this.iniciarCambioAutomatico();
    }

    renderizar() {
        this.container.innerHTML = `
            <div class="tarjeta-derecha">
                <div class="contenido-tarjeta-derecha">
                    <div class="imagen-tarjeta-derecha">
                        <img id="imagenTarjetaDerecha" src="" alt="Imagen lateral derecha">
                    </div>
                </div>
            </div>
        `;

        this.actualizarImagen();
    }

    actualizarImagen() {
        const imagenDerecha = document.getElementById('imagenTarjetaDerecha');
        
        if (!imagenDerecha || this.imagenes.length === 0) {
            return;
        }

        // Seleccionar imagen aleatoria del array
        const indiceAleatorio = Math.floor(Math.random() * this.imagenes.length);

        // Actualizar la imagen
        imagenDerecha.src = this.imagenes[indiceAleatorio];
        imagenDerecha.alt = `Imagen lateral derecha ${indiceAleatorio + 1}`;
    }

    iniciarCambioAutomatico(intervalo = 30000) {
        if (this.intervaloCambio) {
            clearInterval(this.intervaloCambio);
        }

        this.intervaloCambio = setInterval(() => {
            this.actualizarImagen();
        }, intervalo);
    }

    detenerCambioAutomatico() {
        if (this.intervaloCambio) {
            clearInterval(this.intervaloCambio);
            this.intervaloCambio = null;
        }
    }

    actualizarImagenesLista(nuevasImagenes) {
        this.imagenes = nuevasImagenes;
        this.actualizarImagen();
    }

    // Método para cambiar a una imagen específica
    cambiarImagenEspecifica(indice) {
        if (indice >= 0 && indice < this.imagenes.length) {
            const imagenDerecha = document.getElementById('imagenTarjetaDerecha');
            if (imagenDerecha) {
                imagenDerecha.src = this.imagenes[indice];
                imagenDerecha.alt = `Imagen lateral derecha ${indice + 1}`;
            }
        }
    }
}