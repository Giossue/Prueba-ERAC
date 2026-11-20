<?php

declare(strict_types=1);

/**
 * Configuración de la aplicación.
 *
 * Cada valor se puede sobrescribir con una variable de entorno, por ejemplo:
 *   DB_PASS=secreto php -S localhost:8000 -t public
 */
return [
    'bd' => [
        'host' => getenv('DB_HOST') ?: 'localhost',
        'puerto' => getenv('DB_PORT') ?: '5432',
        'nombre' => getenv('DB_NAME') ?: 'pruebaErac',
        'usuario' => getenv('DB_USER') ?: 'erac',
        'clave' => getenv('DB_PASS') ?: 'erac123',
    ],
];
