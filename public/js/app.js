'use strict';

const api = 'api/reservas.php';
const formulario = document.getElementById('formulario-reserva');
const mensaje = document.getElementById('mensaje');

// Todas las peticiones usan JSON y muestran los errores enviados por PHP.
async function llamarApi(url, opciones = {}) {
    const respuesta = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
        ...opciones,
    });
    const datos = await respuesta.json().catch(() => null);

    if (!respuesta.ok) {
        const error = new Error(datos?.error || 'Error al consultar el servidor');
        error.detalles = datos?.detalles || {};
        throw error;
    }
    return datos;
}

function mostrarMensaje(texto, esError = false) {
    mensaje.textContent = texto;
    mensaje.className = esError ? 'mensaje error' : 'mensaje exito';
    mensaje.hidden = false;
}

function mostrarErrores(errores = {}) {
    const mensajes = formulario.querySelectorAll('[data-error-para]');
    for (const elemento of mensajes) {
        const nombre = elemento.dataset.errorPara;
        const error = errores[nombre] || '';
        elemento.textContent = error;
        formulario.elements[nombre].setAttribute('aria-invalid', error ? 'true' : 'false');
    }
}

async function cargarCatalogos() {
    const datos = await llamarApi(`${api}?reporte=catalogos`);
    formulario.elements.fecha_uso.min = datos.fecha_actual;

    for (const solicitante of datos.solicitantes) {
        const texto = `${solicitante.nombre} · ${solicitante.cedula_solicitante}`;
        formulario.elements.id_solicitante.add(new Option(texto, solicitante.cedula_solicitante));
    }
    for (const espacio of datos.espacios) {
        formulario.elements.id_espacio.add(new Option(espacio.nombre, espacio.id_espacio));
    }
}

// Se usa textContent para mostrar los datos como texto.
function crearCelda(texto) {
    const celda = document.createElement('td');
    celda.textContent = texto;
    return celda;
}

function crearEstado(texto) {
    const estado = document.createElement('span');
    estado.className = `estado estado-${texto.toLowerCase()}`;
    estado.textContent = texto;
    return estado;
}

function crearBoton(texto, id, estado) {
    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'boton pequeno';
    boton.textContent = texto;
    boton.addEventListener('click', () => cambiarEstado(id, estado, boton));
    return boton;
}

function mostrarTabla(id, reservas, mostrarAcciones = false) {
    const lista = document.getElementById(id);
    if (!lista) return;
    lista.replaceChildren();

    if (reservas.length === 0) {
        const fila = document.createElement('tr');
        const celda = crearCelda('No hay reservas para mostrar.');
        celda.colSpan = mostrarAcciones ? 5 : 4;
        celda.className = 'vacio';
        fila.append(celda);
        lista.append(fila);
        return;
    }

    for (const reserva of reservas) {
        const fila = document.createElement('tr');
        const celdaEstado = document.createElement('td');
        celdaEstado.append(crearEstado(reserva.estado));
        fila.append(
            crearCelda(reserva.solicitante),
            crearCelda(reserva.espacio),
            crearCelda(reserva.fecha_uso),
            celdaEstado,
        );

        if (mostrarAcciones) {
            const celdaAcciones = document.createElement('td');
            if (reserva.estado === 'Pendiente') {
                const acciones = document.createElement('div');
                acciones.className = 'acciones';
                acciones.append(
                    crearBoton('Confirmar', reserva.id_reserva, 'Confirmada'),
                    crearBoton('Rechazar', reserva.id_reserva, 'Rechazada'),
                );
                celdaAcciones.append(acciones);
            } else {
                celdaAcciones.textContent = '—';
            }
            fila.append(celdaAcciones);
        }
        lista.append(fila);
    }
}

function mostrarMovil(reservas) {
    const lista = document.getElementById('lista-movil');
    if (!lista) return;
    lista.replaceChildren();

    if (reservas.length === 0) {
        lista.textContent = 'No hay reservas para mostrar.';
        return;
    }

    for (const reserva of reservas) {
        const tarjeta = document.createElement('article');
        const nombre = document.createElement('h3');
        const fecha = document.createElement('p');
        tarjeta.className = 'reserva-movil';
        nombre.textContent = reserva.espacio;
        fecha.textContent = `Fecha de uso: ${reserva.fecha_uso}`;
        tarjeta.append(nombre, fecha, crearEstado(reserva.estado));
        lista.append(tarjeta);
    }
}

async function cargarReportes() {
    const general = await llamarApi(`${api}?reporte=general`);
    mostrarTabla('lista-general', general, true);
    mostrarMovil(general);

    if (document.getElementById('lista-pendientes')) {
        const pendientes = await llamarApi(`${api}?reporte=pendientes`);
        mostrarTabla('lista-pendientes', pendientes);
    }
}

async function actualizarReportes() {
    try {
        await cargarReportes();
    } catch (error) {
        mostrarMensaje('El cambio se guardó, pero no se pudo actualizar el reporte.', true);
    }
}

async function cambiarEstado(id, estado, boton) {
    boton.disabled = true;
    try {
        await llamarApi(`${api}?id=${encodeURIComponent(id)}`, {
            method: 'PATCH',
            body: JSON.stringify({ estado }),
        });
        mostrarMensaje(`Reserva ${estado.toLowerCase()}.`);
        await actualizarReportes();
    } catch (error) {
        mostrarMensaje(error.message, true);
        await cargarReportes().catch(() => {});
    } finally {
        boton.disabled = false;
    }
}

formulario.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    mostrarErrores();
    const boton = formulario.querySelector('button[type="submit"]');
    const datos = {
        id_solicitante: formulario.elements.id_solicitante.value,
        id_espacio: formulario.elements.id_espacio.value,
        fecha_uso: formulario.elements.fecha_uso.value,
    };

    const errores = {};
    if (!datos.id_solicitante) errores.id_solicitante = 'Selecciona un solicitante';
    if (!datos.id_espacio) errores.id_espacio = 'Selecciona un espacio';
    if (!datos.fecha_uso) {
        errores.fecha_uso = 'Selecciona una fecha de uso';
    } else if (formulario.elements.fecha_uso.min && datos.fecha_uso < formulario.elements.fecha_uso.min) {
        errores.fecha_uso = 'La fecha de uso no puede ser anterior a hoy';
    }
    if (Object.keys(errores).length > 0) {
        mostrarErrores(errores);
        mostrarMensaje('Revisa los campos del formulario.', true);
        return;
    }

    boton.disabled = true;
    try {
        await llamarApi(api, { method: 'POST', body: JSON.stringify(datos) });
        formulario.reset();
        mostrarMensaje('Solicitud registrada con estado Pendiente.');
        await actualizarReportes();
    } catch (error) {
        mostrarErrores(error.detalles);
        mostrarMensaje(error.message, true);
    } finally {
        boton.disabled = false;
    }
});

// Cambia la sección visible al pulsar una pestaña.
for (const boton of document.querySelectorAll('[data-pantalla]')) {
    boton.addEventListener('click', () => {
        for (const opcion of document.querySelectorAll('[data-pantalla]')) {
            const activa = opcion === boton;
            opcion.classList.toggle('activa', activa);
            opcion.setAttribute('aria-pressed', String(activa));
            document.getElementById(`pantalla-${opcion.dataset.pantalla}`).hidden = !activa;
        }
    });
}

async function iniciar() {
    try {
        await cargarCatalogos();
        await cargarReportes();
    } catch (error) {
        mostrarMensaje(`No se pudieron cargar los datos: ${error.message}`, true);
    }
}

iniciar();
