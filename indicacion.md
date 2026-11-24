Modelo relacional Reservas de Espacios Deportivos Universitario
solicitante(cedula_solicitante(10), nombre)
espacio_deportivo(id_espacio, nombre)
reserva(id_reserva, id_solicitante, id_espacio, fecha_uso, estado(Pendiente, Confirmada, Rechazada), fecha_registro)

vista vw_reservas_pendientes (que filtre únicamente las reservas pendientes)

La vista se evidenciará mediante un reporte web, no ejecutándola aisladamente en la base de datos.


Ejemplos de visualización esperada:

Tabla:

Solicitante | Espacio | Fecha de uso | Estado | Acciones
Ana López | Cancha 1 | 2025-10-15 | Pendiente | Confirmar/Cancelar




Registrar una reserva seleccionando un solicitante previamente registrado, espacio deportivo y fecha de uso; el estado inicial será "Pendiente".
La fecha se almacenará automáticamente como la fecha actual.

Visualizar un reporte general con nombre del solicitante, espacio y fecha de uso y estado mediante una consulta multitabla


Programación Móvil:
Diseñar 2 pantallas móviles con el mismo stack legible, 1 Solicitud de reserva con solicitante, espacio, fecha de uso, botón enviar 2. consulta con lista de reservas que muestre espacio, fecha de uso y estado. Se aceptan datos simulados.