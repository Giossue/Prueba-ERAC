<?php

declare(strict_types=1);

/**
 * Crea bajo demanda una única conexión PDO a PostgreSQL, compartida por toda la petición.
 */
final class BaseDatos
{
    private static ?PDO $conexion = null;

    public static function conexion(): PDO
    {
        if (self::$conexion === null) {
            $config = require __DIR__ . '/../config/config.php';
            $bd = $config['bd'];

            $dsn = "pgsql:host={$bd['host']};port={$bd['puerto']};dbname={$bd['nombre']}";

            self::$conexion = new PDO($dsn, $bd['usuario'], $bd['clave'], [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
        }

        return self::$conexion;
    }
}
