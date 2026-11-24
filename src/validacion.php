<?php

declare(strict_types=1);

function fecha_actual(): string
{
    return (new DateTimeImmutable('now', new DateTimeZone('America/Guayaquil')))->format('Y-m-d');
}

function validar_reserva(array $entrada): array
{
    $errores = [];
    $solicitante = $entrada['id_solicitante'] ?? null;
    if (!is_string($solicitante) || !preg_match('/^[0-9]{10}$/D', $solicitante)) {
        $errores['id_solicitante'] = 'Selecciona un solicitante válido';
    }
    $espacio = filter_var($entrada['id_espacio'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
    if ($espacio === false) {
        $errores['id_espacio'] = 'Selecciona un espacio válido';
    }
    $fecha = $entrada['fecha_uso'] ?? null;
    $fechaValida = is_string($fecha) && preg_match('/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/D', $fecha)
        ? DateTimeImmutable::createFromFormat('!Y-m-d', $fecha)
        : false;
    if (!$fechaValida || $fechaValida->format('Y-m-d') !== $fecha) {
        $errores['fecha_uso'] = 'Selecciona una fecha válida';
    } elseif ($fecha < fecha_actual()) {
        $errores['fecha_uso'] = 'La fecha de uso no puede ser anterior a hoy';
    }
    if ($errores !== []) {
        return [null, $errores];
    }
    return [['id_solicitante' => $solicitante, 'id_espacio' => $espacio, 'fecha_uso' => $fecha], []];
}
