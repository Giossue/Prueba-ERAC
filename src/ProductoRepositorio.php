<?php

declare(strict_types=1);

/**
 * Acceso a datos de la tabla `productos`. Todas las consultas usan sentencias preparadas.
 */
final class ProductoRepositorio
{
    private const COLUMNAS = 'id, nombre, descripcion, precio, stock, creado_en';

    public function __construct(private PDO $pdo)
    {
    }

    /** @return list<array<string, mixed>> */
    public function todos(): array
    {
        $consulta = $this->pdo->query('SELECT ' . self::COLUMNAS . ' FROM productos ORDER BY id');

        return array_map([$this, 'normalizar'], $consulta->fetchAll());
    }

    /** @return array<string, mixed>|null Null si el producto no existe. */
    public function buscar(int $id): ?array
    {
        $consulta = $this->pdo->prepare('SELECT ' . self::COLUMNAS . ' FROM productos WHERE id = :id');
        $consulta->execute(['id' => $id]);
        $fila = $consulta->fetch();

        return $fila === false ? null : $this->normalizar($fila);
    }

    /**
     * @param array{nombre: string, descripcion: string, precio: float, stock: int} $datos
     * @return array<string, mixed>
     */
    public function crear(array $datos): array
    {
        $consulta = $this->pdo->prepare(
            'INSERT INTO productos (nombre, descripcion, precio, stock)
             VALUES (:nombre, :descripcion, :precio, :stock)
             RETURNING ' . self::COLUMNAS
        );
        $consulta->execute($datos);

        return $this->normalizar($consulta->fetch());
    }

    /**
     * @param array{nombre: string, descripcion: string, precio: float, stock: int} $datos
     * @return array<string, mixed>|null Null si el producto no existe.
     */
    public function actualizar(int $id, array $datos): ?array
    {
        $consulta = $this->pdo->prepare(
            'UPDATE productos
             SET nombre = :nombre, descripcion = :descripcion, precio = :precio, stock = :stock
             WHERE id = :id
             RETURNING ' . self::COLUMNAS
        );
        $consulta->execute($datos + ['id' => $id]);
        $fila = $consulta->fetch();

        return $fila === false ? null : $this->normalizar($fila);
    }

    /** @return bool False si el producto no existe. */
    public function eliminar(int $id): bool
    {
        $consulta = $this->pdo->prepare('DELETE FROM productos WHERE id = :id');
        $consulta->execute(['id' => $id]);

        return $consulta->rowCount() > 0;
    }

    /**
     * PostgreSQL devuelve NUMERIC como texto; se convierte a los tipos JSON correctos.
     *
     * @param array<string, mixed> $fila
     * @return array<string, mixed>
     */
    private function normalizar(array $fila): array
    {
        return [
            'id' => (int) $fila['id'],
            'nombre' => $fila['nombre'],
            'descripcion' => $fila['descripcion'],
            'precio' => (float) $fila['precio'],
            'stock' => (int) $fila['stock'],
            'creado_en' => $fila['creado_en'],
        ];
    }
}
