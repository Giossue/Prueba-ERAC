'use strict';

const URL_API = 'api/productos.php';

const formulario = document.getElementById('formulario-producto');
const tituloFormulario = document.getElementById('titulo-formulario');
const campoId = document.getElementById('producto-id');
const botonGuardar = document.getElementById('boton-guardar');
const botonCancelar = document.getElementById('boton-cancelar');
const lista = document.getElementById('lista-productos');
const mensaje = document.getElementById('mensaje');

const formatoPrecio = new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
});

let temporizadorMensaje = null;

/**
 * Llama a la API y devuelve el JSON ya parseado (o null si la respuesta es 204).
 * Lanza un Error con `detalles` cuando el servidor responde con un error.
 */
async function llamarApi(url, opciones = {}) {
    const respuesta = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
        ...opciones,
    });

    if (respuesta.status === 204) {
        return null;
    }

    const datos = await respuesta.json().catch(() => null);

    if (!respuesta.ok) {
        const error = new Error(datos?.error ?? `Error HTTP ${respuesta.status}`);
        error.detalles = datos?.detalles ?? {};
        throw error;
    }

    return datos;
}

function mostrarMensaje(texto, tipo = 'exito') {
    mensaje.textContent = texto;
    mensaje.className = `mensaje ${tipo}`;
    mensaje.hidden = false;
    clearTimeout(temporizadorMensaje);
    temporizadorMensaje = setTimeout(() => (mensaje.hidden = true), 4000);
}

function mostrarErroresCampos(errores = {}) {
    formulario.querySelectorAll('[data-error-para]').forEach((elemento) => {
        const campo = elemento.dataset.errorPara;
        elemento.textContent = errores[campo] ?? '';
        formulario.elements[campo].classList.toggle('invalido', Boolean(errores[campo]));
    });
}

/** Crea una celda de tabla usando textContent, lo que evita ataques XSS. */
function crearCelda(texto, clase) {
    const celda = document.createElement('td');
    celda.textContent = texto;
    if (clase) celda.className = clase;
    return celda;
}

function crearBoton(texto, clase, alHacerClic) {
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.textContent = texto;
    boton.className = `boton boton-chico ${clase}`;
    boton.addEventListener('click', alHacerClic);
    return boton;
}

function mostrarProductos(productos) {
    lista.replaceChildren();

    if (productos.length === 0) {
        const fila = document.createElement('tr');
        const celda = crearCelda('Todavía no hay productos', 'vacio');
        celda.colSpan = 6;
        fila.append(celda);
        lista.append(fila);
        return;
    }

    for (const producto of productos) {
        // Los botones van dentro de un div: aplicar flex directamente al <td>
        // lo saca del layout de tabla y desalinea los bordes de la fila.
        const grupo = document.createElement('div');
        grupo.className = 'acciones-fila';
        grupo.append(
            crearBoton('Editar', '', () => empezarEdicion(producto)),
            crearBoton('Eliminar', 'boton-peligro', () => eliminarProducto(producto)),
        );
        const celdaAcciones = document.createElement('td');
        celdaAcciones.append(grupo);

        const fila = document.createElement('tr');
        fila.append(
            crearCelda(producto.id),
            crearCelda(producto.nombre),
            crearCelda(producto.descripcion),
            crearCelda(formatoPrecio.format(producto.precio), 'numero'),
            crearCelda(producto.stock, 'numero'),
            celdaAcciones,
        );
        lista.append(fila);
    }
}

async function cargarProductos() {
    try {
        mostrarProductos(await llamarApi(URL_API));
    } catch (error) {
        lista.replaceChildren();
        mostrarMensaje(`No se pudieron cargar los productos: ${error.message}`, 'error');
    }
}

function empezarEdicion(producto) {
    campoId.value = producto.id;
    formulario.elements.nombre.value = producto.nombre;
    formulario.elements.descripcion.value = producto.descripcion;
    formulario.elements.precio.value = producto.precio;
    formulario.elements.stock.value = producto.stock;

    tituloFormulario.textContent = `Editar producto #${producto.id}`;
    botonCancelar.hidden = false;
    mostrarErroresCampos();
    formulario.elements.nombre.focus();
}

function limpiarFormulario() {
    formulario.reset();
    campoId.value = '';
    tituloFormulario.textContent = 'Nuevo producto';
    botonCancelar.hidden = true;
    mostrarErroresCampos();
}

async function eliminarProducto(producto) {
    if (!confirm(`¿Eliminar "${producto.nombre}"?`)) return;

    try {
        await llamarApi(`${URL_API}?id=${producto.id}`, { method: 'DELETE' });
        if (campoId.value === String(producto.id)) limpiarFormulario();
        mostrarMensaje('Producto eliminado');
        await cargarProductos();
    } catch (error) {
        mostrarMensaje(error.message, 'error');
    }
}

formulario.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const id = campoId.value;
    const datos = {
        nombre: formulario.elements.nombre.value,
        descripcion: formulario.elements.descripcion.value,
        precio: formulario.elements.precio.value,
        stock: formulario.elements.stock.value,
    };

    botonGuardar.disabled = true;
    try {
        await llamarApi(id ? `${URL_API}?id=${id}` : URL_API, {
            method: id ? 'PUT' : 'POST',
            body: JSON.stringify(datos),
        });
        mostrarMensaje(id ? 'Producto actualizado' : 'Producto creado');
        limpiarFormulario();
        await cargarProductos();
    } catch (error) {
        mostrarErroresCampos(error.detalles);
        mostrarMensaje(error.message, 'error');
    } finally {
        botonGuardar.disabled = false;
    }
});

botonCancelar.addEventListener('click', limpiarFormulario);

cargarProductos();
