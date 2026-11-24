'use strict';

const api = 'api/reservas.php';
const formulario = document.getElementById('formulario-reserva');
const mensaje = document.getElementById('mensaje');

async function llamarApi(url, opciones = {}) {
    const respuesta = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...opciones });
    const datos = await respuesta.json().catch(() => null);
    if (!respuesta.ok) {
        const error = new Error(datos?.error ?? `Error HTTP ${respuesta.status}`);
        error.detalles = datos?.detalles ?? {};
        throw error;
    }
    return datos;
}

function mostrarMensaje(texto, error = false) {
    mensaje.textContent = texto;
    mensaje.className = `mensaje ${error ? 'error' : 'exito'}`;
    mensaje.hidden = false;
}

function erroresCampos(errores = {}) {
    formulario.querySelectorAll('[data-error-para]').forEach((elemento) => {
        const nombre = elemento.dataset.errorPara;
        elemento.textContent = errores[nombre] ?? '';
        formulario.elements[nombre].setAttribute('aria-invalid', errores[nombre] ? 'true' : 'false');
    });
}

async function cargarCatalogos() {
    const datos = await llamarApi(`${api}?reporte=catalogos`);
    for (const solicitante of datos.solicitantes) {
        formulario.elements.id_solicitante.add(new Option(`${solicitante.nombre} · ${solicitante.cedula_solicitante}`, solicitante.cedula_solicitante));
    }
    for (const espacio of datos.espacios) {
        formulario.elements.id_espacio.add(new Option(espacio.nombre, espacio.id_espacio));
    }
}

function celda(texto) {
    const elemento = document.createElement('td');
    elemento.textContent = texto;
    return elemento;
}

function estadoVisual(estado) {
    const elemento = document.createElement('span');
    elemento.className = `estado estado-${estado.toLowerCase()}`;
    elemento.textContent = estado;
    return elemento;
}

function mostrarTabla(id, reservas, acciones = false) {
    const lista = document.getElementById(id);
    if (!lista) return;
    lista.replaceChildren();
    if (!reservas.length) {
        const fila = document.createElement('tr');
        const vacio = celda('No hay reservas para mostrar.');
        vacio.colSpan = acciones ? 5 : 4;
        vacio.className = 'vacio';
        fila.append(vacio);
        lista.append(fila);
        return;
    }
    for (const reserva of reservas) {
        const fila = document.createElement('tr');
        const estado = document.createElement('td');
        estado.append(estadoVisual(reserva.estado));
        fila.append(celda(reserva.solicitante), celda(reserva.espacio), celda(reserva.fecha_uso), estado);
        if (acciones) {
            const columna = document.createElement('td');
            const grupo = document.createElement('div');
            grupo.className = 'acciones';
            for (const [texto, nuevoEstado] of [['Confirmar', 'Confirmada'], ['Rechazar', 'Rechazada']]) {
                const boton = document.createElement('button');
                boton.type = 'button';
                boton.className = 'boton pequeno';
                boton.textContent = texto;
                boton.addEventListener('click', () => cambiarEstado(reserva.id_reserva, nuevoEstado, boton));
                grupo.append(boton);
            }
            columna.append(grupo);
            fila.append(columna);
        }
        lista.append(fila);
    }
}

function mostrarMovil(reservas) {
    const lista = document.getElementById('lista-movil');
    if (!lista) return;
    lista.replaceChildren();
    if (!reservas.length) {
        lista.textContent = 'No hay reservas para mostrar.';
        return;
    }
    for (const reserva of reservas) {
        const tarjeta = document.createElement('article');
        tarjeta.className = 'reserva-movil';
        const nombre = document.createElement('h3');
        nombre.textContent = reserva.espacio;
        const fecha = document.createElement('p');
        fecha.textContent = `Fecha de uso: ${reserva.fecha_uso}`;
        tarjeta.append(nombre, fecha, estadoVisual(reserva.estado));
        lista.append(tarjeta);
    }
}

async function cargarReportes() {
    const general = await llamarApi(`${api}?reporte=general`);
    mostrarTabla('lista-general', general);
    mostrarMovil(general);
    if (document.getElementById('lista-pendientes')) {
        mostrarTabla('lista-pendientes', await llamarApi(`${api}?reporte=pendientes`), true);
    }
}

async function cambiarEstado(id, estado, boton) {
    boton.disabled = true;
    try {
        await llamarApi(`${api}?id=${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify({ estado }) });
        await cargarReportes();
        mostrarMensaje(`Reserva ${estado.toLowerCase()}.`);
    } catch (error) {
        mostrarMensaje(error.message, true);
        try { await cargarReportes(); } catch (_) { /* Se conserva el mensaje de error. */ }
    } finally {
        boton.disabled = false;
    }
}

formulario.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    erroresCampos();
    const boton = formulario.querySelector('button[type="submit"]');
    boton.disabled = true;
    try {
        await llamarApi(api, { method: 'POST', body: JSON.stringify({
            id_solicitante: formulario.elements.id_solicitante.value,
            id_espacio: formulario.elements.id_espacio.value,
            fecha_uso: formulario.elements.fecha_uso.value,
        }) });
        formulario.reset();
        mostrarMensaje('Solicitud registrada con estado Pendiente.');
        try { await cargarReportes(); } catch (_) { mostrarMensaje('Solicitud registrada, pero no se pudo actualizar el reporte.', true); }
    } catch (error) {
        erroresCampos(error.detalles);
        mostrarMensaje(error.message, true);
    } finally {
        boton.disabled = false;
    }
});

document.querySelectorAll('[data-pantalla]').forEach((boton) => {
    boton.addEventListener('click', () => {
        document.querySelectorAll('[data-pantalla]').forEach((otro) => {
            const activa = otro === boton;
            otro.classList.toggle('activa', activa);
            otro.setAttribute('aria-pressed', String(activa));
            document.getElementById(`pantalla-${otro.dataset.pantalla}`).hidden = !activa;
        });
    });
});

Promise.all([cargarCatalogos(), cargarReportes()]).catch((error) => mostrarMensaje(`No se pudieron cargar los datos: ${error.message}`, true));
