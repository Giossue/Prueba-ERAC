<?php

declare(strict_types=1);

final class ReservaRepositorio
{
    public function __construct(private PDO $pdo) {}

    public function catalogos(): array
    {
        $solicitantes = $this->pdo->prepare('SELECT cedula_solicitante, nombre FROM solicitante ORDER BY nombre');
        $solicitantes->execute();
        $espacios = $this->pdo->prepare('SELECT id_espacio, nombre FROM espacio_deportivo ORDER BY nombre');
        $espacios->execute();
        return ['solicitantes' => $solicitantes->fetchAll(), 'espacios' => $espacios->fetchAll()];
    }

    public function listar(bool $pendientes): array
    {
        // La vista solo contiene pendientes; ambas consultas combinan las tres entidades.
        $origen = $pendientes ? 'vw_reservas_pendientes' : 'reserva';
        $consulta = $this->pdo->prepare("SELECT r.id_reserva, s.nombre AS solicitante, e.nombre AS espacio,
                    r.fecha_uso, r.estado, r.fecha_registro
                FROM $origen r
                JOIN solicitante s ON s.cedula_solicitante = r.id_solicitante
                JOIN espacio_deportivo e ON e.id_espacio = r.id_espacio
                ORDER BY r.fecha_uso, r.id_reserva");
        $consulta->execute();
        return $consulta->fetchAll();
    }

    public function crear(array $datos): array
    {
        $consulta = $this->pdo->prepare('INSERT INTO reserva (id_solicitante, id_espacio, fecha_uso)
            VALUES (:id_solicitante, :id_espacio, :fecha_uso)
            RETURNING id_reserva, id_solicitante, id_espacio, fecha_uso, estado, fecha_registro');
        $consulta->execute($datos);
        return $consulta->fetch();
    }

    public function cambiarEstado(int $id, string $estado): bool
    {
        $consulta = $this->pdo->prepare("UPDATE reserva SET estado = :estado
            WHERE id_reserva = :id AND estado = 'Pendiente'");
        $consulta->execute(['estado' => $estado, 'id' => $id]);
        return $consulta->rowCount() > 0;
    }
}
