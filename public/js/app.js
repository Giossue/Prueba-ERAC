'use strict';

const api = 'api/reservas.php';
const formulario = document.getElementById('formulario-reserva');
const mensaje = document.getElementById('mensaje');

// Envía una petición a PHP y devuelve su respuesta JSON.
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

// Muestra un mensaje general y los posibles errores de cada campo.
function mostrarMensaje(texto, esError = false) {
    mensaje.textContent = texto;
    mensaje.className = esError ? 'mensaje error' : 'mensaje exito';
    mensaje.hidden = false;
}

function mostrarErrores(errores = {}) {
    for (const elemento of formulario.querySelectorAll('[data-error-para]')) {
        const nombre = elemento.dataset.errorPara;
        elemento.textContent = errores[nombre] || '';
        formulario.elements[nombre].setAttribute('aria-invalid', errores[nombre] ? 'true' : 'false');
    }
}

// Llena los selectores y establece la fecha mínima que envía el servidor.
async function cargarCatalogos() {
    const datos = await llamarApi(`${api}?reporte=catalogos`);
    formulario.elements.fecha_uso.min = datos.fecha_actual;
    for (const persona of datos.solicitantes) {
        const nombre = `${persona.nombre} · ${persona.cedula_solicitante}`;
        formulario.elements.id_solicitante.add(new Option(nombre, persona.cedula_solicitante));
    }
    for (const espacio of datos.espacios) {
        formulario.elements.id_espacio.add(new Option(espacio.nombre, espacio.id_espacio));
    }
}

// Crea elementos con texto seguro para las tablas y la lista móvil.
function crearElemento(tipo, texto = '', clase = '') {
    const elemento = document.createElement(tipo);
    elemento.textContent = texto;
    if (clase) elemento.className = clase;
    return elemento;
}

function crearEstado(estado) {
    return crearElemento('span', estado, `estado estado-${estado.toLowerCase()}`);
}

// Solo las reservas pendientes tienen botones para cambiar de estado.
function crearAcciones(reserva) {
    const acciones = crearElemento('div', '', 'acciones');
    for (const [texto, estado] of [['Confirmar', 'Confirmada'], ['Rechazar', 'Rechazada']]) {
        const boton = crearElemento('button', texto, 'boton pequeno');
        boton.type = 'button';
        boton.addEventListener('click', () => cambiarEstado(reserva.id_reserva, estado, boton));
        acciones.append(boton);
    }
    return acciones;
}

// Muestra uno de los reportes; el general incluye una columna de acciones.
function mostrarTabla(id, reservas, conAcciones = false) {
    const lista = document.getElementById(id);
    if (!lista) return;
    lista.replaceChildren();
    if (reservas.length === 0) {
        const fila = crearElemento('tr');
        const celda = crearElemento('td', 'No hay reservas para mostrar.', 'vacio');
        celda.colSpan = conAcciones ? 5 : 4;
        fila.append(celda);
        lista.append(fila);
        return;
    }
    for (const reserva of reservas) {
        const fila = crearElemento('tr');
        const estado = crearElemento('td');
        estado.append(crearEstado(reserva.estado));
        fila.append(crearElemento('td', reserva.solicitante), crearElemento('td', reserva.espacio),
            crearElemento('td', reserva.fecha_uso), estado);
        if (conAcciones) {
            const celda = crearElemento('td');
            if (reserva.estado === 'Pendiente') {
                celda.append(crearAcciones(reserva));
            } else {
                celda.textContent = '—';
            }
            fila.append(celda);
        }
        lista.append(fila);
    }
}

// La consulta móvil muestra espacio, fecha y estado de cada reserva.
function mostrarMovil(reservas) {
    const lista = document.getElementById('lista-movil');
    if (!lista) return;
    lista.replaceChildren();
    if (reservas.length === 0) {
        lista.textContent = 'No hay reservas para mostrar.';
        return;
    }
    for (const reserva of reservas) {
        const tarjeta = crearElemento('article', '', 'reserva-movil');
        tarjeta.append(crearElemento('h3', reserva.espacio),
            crearElemento('p', `Fecha de uso: ${reserva.fecha_uso}`), crearEstado(reserva.estado));
        lista.append(tarjeta);
    }
}

// Carga ambos reportes; en móvil solo se necesita el general.
async function cargarReportes() {
    const reservas = await llamarApi(`${api}?reporte=general`);
    mostrarTabla('lista-general', reservas, true);
    mostrarMovil(reservas);
    if (document.getElementById('lista-pendientes')) {
        const pendientes = await llamarApi(`${api}?reporte=pendientes`);
        mostrarTabla('lista-pendientes', pendientes);
    }
}

// Si falla la recarga, avisa que el cambio ya se guardó.
async function actualizarReportes() {
    try {
        await cargarReportes();
    } catch (error) {
        mostrarMensaje('El cambio se guardó, pero no se pudo actualizar el reporte.', true);
    }
}

// Envía el nuevo estado y recarga los reportes.
async function cambiarEstado(id, estado, boton) {
    boton.disabled = true;
    try {
        await llamarApi(`${api}?id=${encodeURIComponent(id)}`, {
            method: 'PATCH', body: JSON.stringify({ estado }),
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

// El navegador comprueba los campos obligatorios y la fecha mínima; PHP los valida otra vez.
formulario.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    mostrarErrores();
    const boton = formulario.querySelector('button[type="submit"]');
    const datos = {
        id_solicitante: formulario.elements.id_solicitante.value,
        id_espacio: formulario.elements.id_espacio.value,
        fecha_uso: formulario.elements.fecha_uso.value,
    };
    boton.disabled = true;
    try {
        await llamarApi(api, { method: 'POST', body: JSON.stringify(datos) });
        formulario.reset();
        mostrarMensaje('Solicitud registrada');
        await actualizarReportes();
    } catch (error) {
        mostrarErrores(error.detalles);
        mostrarMensaje(error.message, true);
    } finally {
        boton.disabled = false;
    }
});

// Muestra la sección elegida y oculta las demás.
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

// Al abrir la página se cargan los selectores y los reportes.
async function iniciar() {
    try {
        await cargarCatalogos();
        await cargarReportes();
    } catch (error) {
        mostrarMensaje(`No se pudieron cargar los datos: ${error.message}`, true);
    }
}

iniciar();
