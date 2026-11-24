CREATE TABLE solicitante (
    cedula_solicitante VARCHAR(10) PRIMARY KEY CHECK (cedula_solicitante ~ '^[0-9]{10}$'),
    nombre VARCHAR(100) NOT NULL
);

CREATE TABLE espacio_deportivo (
    id_espacio INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

CREATE TABLE reserva (
    id_reserva INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_solicitante VARCHAR(10) NOT NULL REFERENCES solicitante (cedula_solicitante),
    id_espacio INT NOT NULL REFERENCES espacio_deportivo (id_espacio),
    fecha_uso DATE NOT NULL,
    estado VARCHAR(10) NOT NULL DEFAULT 'Pendiente'
        CHECK (estado IN ('Pendiente', 'Confirmada', 'Rechazada')),
    fecha_registro DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE VIEW vw_reservas_pendientes AS
SELECT id_reserva, id_solicitante, id_espacio, fecha_uso, estado, fecha_registro
FROM reserva
WHERE estado = 'Pendiente';

INSERT INTO solicitante (cedula_solicitante, nombre) VALUES
    ('1234567890', 'Ana López'),
    ('2345678901', 'Luis Pérez'),
    ('3456789012', 'María Espinoza');

INSERT INTO espacio_deportivo (nombre) VALUES
    ('Cancha de fútbol'), ('Cancha de tenis'), ('Cancha de vóley');
