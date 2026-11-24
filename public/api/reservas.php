<?php

declare(strict_types=1);
/*Se pueda visualizar un segundo reporte de reservas pendientes obtenido de la vista SQL solicitida
*/
require __DIR__ . '/../../src/BaseDatos.php';
require __DIR__ . '/../../src/ReservaRepositorio.php';
require __DIR__ . '/../../src/http.php';
require __DIR__ . '/../../src/validacion.php';

try {
    $repositorio = new ReservaRepositorio(BaseDatos::conexion());
    $metodo = $_SERVER['REQUEST_METHOD'];
    if ($metodo === 'GET') {
        $reporte = $_GET['reporte'] ?? 'general';
        if ($reporte === 'catalogos') {
            responder_json($repositorio->catalogos());
        }
        if (!in_array($reporte, ['general', 'pendientes'], true)) {
            responder_error('Reporte no válido', 400);
        }
        responder_json($repositorio->listar($reporte === 'pendientes'));
    }
    if ($metodo === 'POST') {
        [$datos, $errores] = validar_reserva(leer_cuerpo_json());
        if ($errores !== []) {
            responder_error('Hay errores de validación', 422, $errores);
        }
        responder_json($repositorio->crear($datos), 201);
    }
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
    header('Allow: GET, POST, PATCH');
    responder_error('Método no permitido', 405);
} catch (PDOException $e) {
    if ($e->getCode() === '23503') {
        responder_error('El solicitante o el espacio seleccionado ya no existe', 422);
    }
    error_log('Error de base de datos: ' . $e->getMessage());
    responder_error('Error interno del servidor', 500);
}
