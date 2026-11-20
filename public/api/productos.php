<?php

declare(strict_types=1);

/**
 * Endpoint REST de productos.
 *
 *   GET    /api/productos.php          lista todos los productos
 *   GET    /api/productos.php?id=1     obtiene un producto
 *   POST   /api/productos.php          crea (cuerpo JSON)
 *   PUT    /api/productos.php?id=1     actualiza (cuerpo JSON)
 *   DELETE /api/productos.php?id=1     elimina
 */

require __DIR__ . '/../../src/BaseDatos.php';
require __DIR__ . '/../../src/ProductoRepositorio.php';
require __DIR__ . '/../../src/http.php';
require __DIR__ . '/../../src/validacion.php';

try {
    $repositorio = new ProductoRepositorio(BaseDatos::conexion());
    $id = obtener_id();

    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            if ($id === null) {
                responder_json($repositorio->todos());
            }
            $producto = $repositorio->buscar($id);
            if ($producto === null) {
                responder_error('Producto no encontrado', 404);
            }
            responder_json($producto);

        case 'POST':
            [$datos, $errores] = validar_producto(leer_cuerpo_json());
            if ($errores !== []) {
                responder_error('Hay errores de validación', 422, $errores);
            }
            responder_json($repositorio->crear($datos), 201);

        case 'PUT':
            if ($id === null) {
                responder_error('Falta el parámetro id en la URL', 400);
            }
            [$datos, $errores] = validar_producto(leer_cuerpo_json());
            if ($errores !== []) {
                responder_error('Hay errores de validación', 422, $errores);
            }
            $producto = $repositorio->actualizar($id, $datos);
            if ($producto === null) {
                responder_error('Producto no encontrado', 404);
            }
            responder_json($producto);

        case 'DELETE':
            if ($id === null) {
                responder_error('Falta el parámetro id en la URL', 400);
            }
            if (!$repositorio->eliminar($id)) {
                responder_error('Producto no encontrado', 404);
            }
            responder_json(null, 204);

        default:
            header('Allow: GET, POST, PUT, DELETE');
            responder_error('Método no permitido', 405);
    }
} catch (PDOException $e) {
    // Se registra el error real en el log; nunca se muestra al cliente.
    error_log('Error de base de datos: ' . $e->getMessage());
    responder_error('Error interno del servidor', 500);
}
