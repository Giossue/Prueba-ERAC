<?php

declare(strict_types=1);

/**
 * Valida los datos de entrada de un producto.
 *
 * @param array<string, mixed> $entrada
 * @return array{0: array{nombre: string, descripcion: string, precio: float, stock: int}|null, 1: array<string, string>}
 *         [datos limpios o null, campo => mensaje de error]
 */
function validar_producto(array $entrada): array
{
    $errores = [];

    $nombre = is_string($entrada['nombre'] ?? null) ? trim($entrada['nombre']) : '';
    if ($nombre === '') {
        $errores['nombre'] = 'El nombre es obligatorio';
    } elseif (mb_strlen($nombre) > 100) {
        $errores['nombre'] = 'El nombre debe tener como máximo 100 caracteres';
    }

    $descripcion = $entrada['descripcion'] ?? '';
    if (!is_string($descripcion)) {
        $errores['descripcion'] = 'La descripción debe ser texto';
        $descripcion = '';
    }
    $descripcion = trim($descripcion);
    if (mb_strlen($descripcion) > 500) {
        $errores['descripcion'] = 'La descripción debe tener como máximo 500 caracteres';
    }

    $precio = filter_var($entrada['precio'] ?? null, FILTER_VALIDATE_FLOAT);
    if ($precio === false || $precio < 0 || $precio > 99999999.99) {
        $errores['precio'] = 'El precio debe ser un número entre 0 y 99999999.99';
    }

    $stock = filter_var($entrada['stock'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 0]]);
    if ($stock === false) {
        $errores['stock'] = 'El stock debe ser un número entero mayor o igual a 0';
    }

    if ($errores !== []) {
        return [null, $errores];
    }

    return [[
        'nombre' => $nombre,
        'descripcion' => $descripcion,
        'precio' => round($precio, 2),
        'stock' => $stock,
    ], []];
}
