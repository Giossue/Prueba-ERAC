<?php

declare(strict_types=1);

// Datos de conexión para la BD
return [
    'bd' => [
        'host' => getenv('DB_HOST') ?: 'localhost',
        'puerto' => getenv('DB_PORT') ?: '5432',
        'nombre' => getenv('DB_NAME') ?: 'reservas_deportivas',
        'usuario' => getenv('DB_USER') ?: 'erac',
        'clave' => getenv('DB_PASS') ?: 'erac123',
    ],
];
