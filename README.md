# Reservas de espacios deportivos

Aplicación de práctica con HTML, CSS, JavaScript, PHP y PostgreSQL, sin frameworks. Permite registrar solicitudes, consultar todas las reservas y confirmar o rechazar las pendientes. Incluye dos pantallas adaptadas a móvil que utilizan la misma API y los mismos datos.

## Preparación

Se necesita PHP con PDO PostgreSQL y una base de datos PostgreSQL **vacía de práctica**. Crear la base por el medio habitual y cargar el esquema una sola vez:

```bash
psql -h localhost -U erac -d reservas_deportivas -v ON_ERROR_STOP=1 -f database/reservasdeportivas.sql
```

El archivo crea las tres tablas, la vista y datos de ejemplo para solicitantes y espacios. Si la base ya está preparada, no es necesario volver a cargarlo. Las cédulas se guardan como texto para conservar los ceros iniciales. La fecha de registro la asigna PostgreSQL automáticamente y el estado inicial es `Pendiente`.

La configuración predeterminada está en `config/config.php`; se puede adaptar mediante `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` y `DB_PASS`.

```bash
php -S localhost:8000 -t public
```

Abrir <http://localhost:8000> para la gestión web o <http://localhost:8000/movil.html> para las pantallas móviles de solicitud y consulta.

## Reportes y API

- El reporte general combina `reserva`, `solicitante` y `espacio_deportivo` mediante `JOIN`.
- El reporte web de pendientes consulta `vw_reservas_pendientes` y la combina con solicitantes y espacios. Sus acciones solo permiten confirmar o rechazar reservas aún pendientes.

| Método | Ruta | Uso |
| --- | --- | --- |
| GET | `/api/reservas.php?reporte=catalogos` | Solicitantes y espacios disponibles |
| GET | `/api/reservas.php?reporte=general` | Reporte de todas las reservas |
| GET | `/api/reservas.php?reporte=pendientes` | Reporte basado en la vista |
| POST | `/api/reservas.php` | Crear una solicitud |
| PATCH | `/api/reservas.php?id=1` | Cambiar el estado de una reserva pendiente |

Ejemplo de solicitud:

```json
{ "id_solicitante": "1234567890", "id_espacio": 1, "fecha_uso": "2027-05-15" }
```

Para cambiar el estado, enviar `{"estado":"Confirmada"}` o `{"estado":"Rechazada"}`. La API valida los campos y responde con JSON; devuelve 409 si la reserva no existe o ya no está pendiente. La base comprueba las claves foráneas y los estados permitidos.

## Archivos principales

- `database/reservasdeportivas.sql`: modelo, vista y datos iniciales.
- `public/index.html` y `public/movil.html`: interfaces web y móvil.
- `public/js/app.js` y `public/css/estilos.css`: lógica y estilos compartidos.
- `public/api/reservas.php`: API JSON.
- `src/ReservaRepositorio.php`: consultas a PostgreSQL.
