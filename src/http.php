<?php

declare(strict_types=1);

/**
 * Funciones auxiliares para APIs JSON.
 */

function responder_json(mixed $datos, int $estado = 200): never
{
    http_response_code($estado);
    // Una respuesta 204 No Content no debe llevar cuerpo.
    if ($estado !== 204) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($datos, JSON_UNESCAPED_UNICODE);
    }
    exit;
}

function responder_error(string $mensaje, int $estado, array $detalles = []): never
{
    $cuerpo = ['error' => $mensaje];
    if ($detalles !== []) {
        $cuerpo['detalles'] = $detalles;
    }
    responder_json($cuerpo, $estado);
}

/** @return array<string, mixed> */
function leer_cuerpo_json(): array
{
    $texto = file_get_contents('php://input');

    try {
        $datos = json_decode($texto === false ? '' : $texto, true, 512, JSON_THROW_ON_ERROR);
    } catch (JsonException) {
        responder_error('El cuerpo JSON no es válido', 400);
    }

    if (!is_array($datos)) {
        responder_error('El cuerpo JSON debe ser un objeto', 400);
    }

    return $datos;
}

/** Devuelve el parámetro `id` de la URL como entero positivo, o null si no viene. */
function obtener_id(): ?int
{
    if (!isset($_GET['id'])) {
        return null;
    }

    $id = filter_var($_GET['id'], FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
    if ($id === false) {
        responder_error('El id debe ser un número entero positivo', 400);
    }

    return $id;
}
