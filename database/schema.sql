-- Esquema y datos de ejemplo para el CRUD de productos.
-- Ejecutar con: psql -h localhost -U erac -d pruebaErac -f database/schema.sql

DROP TABLE IF EXISTS productos;

CREATE TABLE productos (
    id          INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre      VARCHAR(100)   NOT NULL,
    descripcion VARCHAR(500)   NOT NULL DEFAULT '',
    precio      NUMERIC(10, 2) NOT NULL CHECK (precio >= 0),
    stock       INT            NOT NULL DEFAULT 0 CHECK (stock >= 0),
    creado_en   TIMESTAMPTZ    NOT NULL DEFAULT now()
);

INSERT INTO productos (nombre, descripcion, precio, stock) VALUES
    ('Teclado', 'Teclado mecánico, distribución en español', 49.90, 12),
    ('Mouse',   'Mouse óptico inalámbrico',                 19.99, 30),
    ('Monitor', 'Monitor IPS de 27 pulgadas',               229.00, 5);
