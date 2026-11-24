<?php

declare(strict_types=1);

// Crea una conexión PDO a PostgreSQL usando la configuración del proyecto.
final class BaseDatos
{
    public static function conexion(): PDO
    {
        $config = require __DIR__ . '/../config/config.php';
        $bd = $config['bd'];

        // El DSN indica a PDO el servidor, el puerto y la base de datos.
        $dsn = "pgsql:host={$bd['host']};port={$bd['puerto']};dbname={$bd['nombre']}";

        return new PDO($dsn, $bd['usuario'], $bd['clave'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
    }
}
