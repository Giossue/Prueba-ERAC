<?php

declare(strict_types=1);

/**
 * Configuración de la aplicación
 */
return [
    'bd' => [
        'host' => getenv('DB_HOST') ?: 'localhost',
        'puerto' => getenv('DB_PORT') ?: '5432',
        'nombre' => getenv('DB_NAME') ?: 'reservas_deportivas',
        'usuario' => getenv('DB_USER') ?: 'erac',
        'clave' => getenv('DB_PASS') ?: 'erac123',
    ],
];
