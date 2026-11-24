<?php

declare(strict_types=1);

// Carga la conexión, las consultas y las funciones de validación y respuesta.
require __DIR__ . '/../../src/BaseDatos.php';
require __DIR__ . '/../../src/ReservaRepositorio.php';
require __DIR__ . '/../../src/http.php';
require __DIR__ . '/../../src/validacion.php';

try {
    // El método HTTP indica si se quieren consultar, crear o actualizar datos.
    $repositorio = new ReservaRepositorio(BaseDatos::conexion());
    $metodo = $_SERVER['REQUEST_METHOD'];
    // GET entrega los catálogos o uno de los dos reportes.
    if ($metodo === 'GET') {
        $reporte = $_GET['reporte'] ?? 'general';
        if ($reporte === 'catalogos') {
            $catalogos = $repositorio->catalogos();
            $catalogos['fecha_actual'] = fecha_actual();
            responder_json($catalogos);
        }
        if (!in_array($reporte, ['general', 'pendientes'], true)) {
            responder_error('Reporte no válido', 400);
        }
        responder_json($repositorio->listar($reporte === 'pendientes'));
    }
    // POST recibe una solicitud, valida sus datos y la guarda si son correctos.
    if ($metodo === 'POST') {
        [$datos, $errores] = validar_reserva(leer_cuerpo_json());
        if ($errores !== []) {
            responder_error('Hay errores de validación', 422, $errores);
        }
        responder_json($repositorio->crear($datos), 201);
    }
    // PATCH confirma o rechaza una reserva que todavía esté pendiente.
    if ($metodo === 'PATCH') {
        $id = obtener_id();
        if ($id === null) {
            responder_error('Falta el parámetro id', 400);
        }
        $entrada = leer_cuerpo_json();
        $estado = $entrada['estado'] ?? null;
        if (!in_array($estado, ['Confirmada', 'Rechazada'], true)) {
            responder_error('Selecciona un estado válido', 422);
        }
        if (!$repositorio->cambiarEstado($id, $estado)) {
            responder_error('La reserva no existe o ya no está pendiente', 409);
        }
        responder_json(['mensaje' => 'Estado actualizado']);
    }
    // Cualquier otro método recibe una respuesta de método no permitido.
    header('Allow: GET, POST, PATCH');
    responder_error('Método no permitido', 405);
} catch (PDOException $e) {
    // Una clave foránea inválida indica que el solicitante o el espacio no existe.
    if ($e->getCode() === '23503') {
        responder_error('El solicitante o el espacio seleccionado ya no existe', 422);
    }
    // El detalle técnico queda en el registro del servidor, no en la página.
    error_log('Error de base de datos: ' . $e->getMessage());
    responder_error('Error interno del servidor', 500);
}
